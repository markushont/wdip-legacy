// Fetch motions from Riksdagen API and insert into DB

"use strict";

var AWS = require("aws-sdk");
var moment = require("moment");
const sizeof = require("object-sizeof");
const urlHelpers = require("./urlHelpers");
const docHelpers = require("./docHelpers");
var errorHelper = require("./errorHelper");
const logger = require("../logger");
const dbClient = require("../dbclient");
const {
  WDIP_MOTION_INDEX,
  WDIP_MOTION_REQUEST_LOG_INDEX,
  MAX_PAGINATED_PAGES,
  DATE_ZERO,
  FETCH_MOTIONS,
  FETCH_PROPOSITIONS
} = require("../config/config");

// Point to local DB instance
if (process.env.IS_OFFLINE || process.env.IS_LOCAL) {
  AWS.config.update({
    region: "eu-west-1",
    endpoint: "http://localhost:8000"
  });
}

// Add entry to request log
async function logRequest(isSuccess, fetchedTo, nAdded) {
  logger.debug(`Logging request. isSuccess: ${isSuccess}, fetchedTo: ${fetchedTo}, nAdded: ${nAdded}`);
  let date = (fetchedTo != null) ? fetchedTo : moment().valueOf();
  let toPut = {
    index: WDIP_MOTION_REQUEST_LOG_INDEX,
    type: "_doc",
    body: {
      success: isSuccess,
      date: date,
      errors: errorHelper.getLoggedErrors(),
      incompleteDocs: errorHelper.getIncompleteDocs(),
      nAdded: nAdded
    }
  };

  return dbClient.index(toPut);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function getDateString(dateInt) {
  if (dateInt === null || dateInt === undefined) { return null; }

  let date = moment(dateInt);
  return date.format("YYYY-MM-DD");
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// Parse results and put to db
async function parseQueryResult(data) {
  let toAddItems = [];

  for (const dok of data.dokumentlista.dokument) {
    let basicInfo = docHelpers.parseBasicInfo(dok);
    let statusInfo = {};
    const statusUrl = urlHelpers.getDocStatusQuery(dok.dok_id);
    try {
      const statusResp = await urlHelpers.getJsonFromUrl(statusUrl);
      statusInfo = docHelpers.parseStatusObj(statusResp.dokumentstatus);
    } catch (error) {
      errorHelper.logError("Could not fetch status for url " + statusUrl +
        "\n Reason: " + error);
      errorHelper.logIncomplete(dok.dok_id);
      statusInfo.isPending = true;
    }

    let toAdd = {};
    Object.assign(toAdd, basicInfo, statusInfo);
    toAddItems.push({
      index: {
        _index: WDIP_MOTION_INDEX,
        _type: "_doc",
        _id: basicInfo.dok_id
      }
    });
    toAddItems.push(toAdd);
  }

  //Each document consists of two entries, action description and the data itself.
  const nItems = toAddItems.length / 2;

  if (nItems > 0) {
    logger.debug(`Writing ${nItems} items to DB.`);
    try {
      const { items } = await dbClient.bulk({body: toAddItems });
      let nAdded = 0;
      for (const item of items) {
        if (item.index.status === 200 || item.index.status === 201) {
          ++nAdded;
        } else {
          errorHelper.logIncomplete(item.index._id);
        }
      }
      return nAdded;
    } catch (err) {
      for (let i = 1; i < toAddItems.length; i += 2) {
        errorHelper.logIncomplete(item.dok_id);
      }
    }
  } else {
    logger.debug("No items to write for page, skipping");
    return new Promise((resolve, reject) => resolve(0));
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

async function fetchDocuments(fromDate, toDate, getDocQueryFunc) {
  let docQuery = getDocQueryFunc(getDateString(fromDate), getDateString(toDate));

  // fetch documents page by page
  let nAdded = 0;
  let shouldFetch = true;
  let fetchedTo = fromDate;
  while (shouldFetch) {
    try {
      const jsonResp = await urlHelpers.getJsonFromUrl(docQuery);
      const docs = jsonResp.dokumentlista;
      const nDocs = jsonResp.dokumentlista.dokument.length;
      const hasMoreResults = docs["@sida"] === MAX_PAGINATED_PAGES.toString();
      const lastPage = docs["@sida"] === docs["@sidor"];
      const nextUrl = docs["@nasta_sida"];
      fetchedTo = docs.dokument[nDocs - 1].datum;

      // parse results and put to db
      try {
        const toAdd = await parseQueryResult(jsonResp);
        nAdded += toAdd;
      } catch (parseErr) {
        logger.error("Error when parsing query result");
        for (const doc of docs.dokument) {
          errorHelper.logIncomplete(doc.dok_id);
        }
      }

      // check for next url to fetch or break out of loop
      if (lastPage && !hasMoreResults) {
        shouldFetch = false;
      } else if (nextUrl && nextUrl === docQuery) {
        shouldFetch = false;
      } else if (hasMoreResults) {
        docQuery = getDocQueryFunc(getDateString(fetchedTo), getDateString(toDate));
      } else {
        docQuery = docs["@nasta_sida"];
      }
    } catch (err) {
      if (err.code === "ETIMEDOUT") { // try again
        logger.debug(`Request with url ${docQuery} timed out, trying again`);
        continue;
      } else { // something else is wrong, give up
        errorHelper.logError(`Error when fetching results: ${err}`);
        shouldFetch = false;
      }
    }
  }

  return { nAdded, fetchedTo };
}

///////////////////////////////////////////////////////////////////////////////////////////////////

async function getFetchInterval(fromDateStrOverride = null, toDateStrOverride = null) {
  const requestLogQueryParams = {
    index: WDIP_MOTION_REQUEST_LOG_INDEX,
    q: "success:true",
    size: "1",
    sort: "date:desc"
  };

  const dateZero = moment(DATE_ZERO, "YYYY-MM-DD").valueOf();
  logger.debug(`dateZero: ${dateZero}`);

  // Deduce fetchFrom
  let from = dateZero;
  if (fromDateStrOverride) {
    from = fromDateStrOverride;
  } else {
    // Check last successful fetch from db
    try {
      const { count } = await dbClient.count( {index: WDIP_MOTION_REQUEST_LOG_INDEX });
      if (count) {
        try {
          const { hits: {hits} } = await dbClient.search(requestLogQueryParams);
          if (hits.length) {
            from = hits[0]._source.date;
          }
        } catch (error) {
          errorHelper.logError(`Unable to fetch request log entry. Error:\n ${error} \nDefaulting to ${DATE_ZERO}.`);
        }
      }
    } catch (error) {
      errorHelper.logError(`Failed to 'count' WDIP_MOTION_REQUEST_LOG_INDEX. Error: ${err}`);
    }
  }

  // Deduce fetchTo
  const to = toDateStrOverride || Date.now().valueOf();

  logger.debug(`FETCHING FROM: ${from}\nFETCHING TO: ${to}`);
  return { from, to };
}

///////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = async function fetchMotions(fromDateStrOverride = null, toDateStrOverride = null, callback) {
  // Get fetch interval
  let fetchFrom;
  let fetchTo;
  try {
    const { from, to } = await getFetchInterval(fromDateStrOverride, toDateStrOverride);
    fetchFrom = from;
    fetchTo = to;
  } catch (err) {
    logger.error(`Something went wrong when deducing date interval. Error: ${err}`);
    callback(500, `Something went wrong when deducing date interval. Error: ${err}`);
    return;
  }

  // Do nothing if interval is zero
  if (fetchFrom === fetchTo) {
    logger.debug("Interval is zero, nothing to fetch");
    callback(200, { statusCode: 200, body: "Interval is zero, nothing to fetch" });
    return;
  }

  let nTotAdded = 0;
  let totFetchedTo = 0;

  // Fetch motions
  if (FETCH_MOTIONS) {
    const { nAdded, fetchedTo } =
      await fetchDocuments(fetchFrom, fetchTo, urlHelpers.getMotionQuery);
    nTotAdded += nAdded;
    totFetchedTo = fetchedTo;
  }

  // Fetch propositions
  if (FETCH_PROPOSITIONS) {
    const { nAdded, fetchedTo } =
      await fetchDocuments(fetchFrom, fetchTo, urlHelpers.getPropositionQuery);
    nTotAdded += nAdded;
    totFetchedTo = (totFetchedTo < fetchedTo) ? totFetchedTo : fetchedTo;
  }

  // log result and exit
  logger.debug(`Successfully added ${nTotAdded} documents.`);
  try {
    const { logResp } = await logRequest(true, totFetchedTo, nTotAdded);
    callback(200, `Successfully added ${nTotAdded} documents.`);
  } catch (err) {
    logger.error(`Error adding entry to request log: ${err}`);
    callback(500, "Error adding entry to request log");
  }
};
