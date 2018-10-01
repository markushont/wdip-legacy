// Fetch motions from Riksdagen API and insert into DB

'use strict';

var AWS = require('aws-sdk');
var moment = require('moment');
const sizeof = require('object-sizeof');
const urlHelpers = require('./urlHelpers');
const docHelpers = require('./docHelpers');
var errorHelper = require('./errorHelper');

// Point to local DB instance
if (process.env.IS_OFFLINE || process.env.IS_LOCAL) {
  AWS.config.update({
    region: "eu-west-1",
    endpoint: "http://localhost:8000"
  });
}

var dynamoDb = new AWS.DynamoDB();
var documentClient = new AWS.DynamoDB.DocumentClient();

///////////////////////////////////////////////////////////////////////////////////////////////////

// Add entry to request log
function logRequest(isSuccess, fetchedTo) {
  let id = isSuccess ? "success" : "fail";
  let date = (fetchedTo != null) ? fetchedTo : moment().valueOf();
  let toPut = {
    Item: {
      id: id,
      date: date,
      errors: errorHelper.getLoggedErrors()
    },
    ReturnConsumedCapacity: "TOTAL",
    TableName: process.env.MOTION_REQUEST_LOG_TABLE
  };

  return documentClient.put(toPut, function(err, data) {
    if (err) console.log("Error logging request. Error: " + err);
    else console.log("Logged request. Success: " + isSuccess.toString() + ". FetchedTo: " + fetchedTo);
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function getDateString(dateInt) {
  if (dateInt === null || dateInt === undefined) return null;

  let date = moment(dateInt);
  return date.format('YYYY-MM-DD');
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// Parse results and put to db
async function parseQueryResult(data) {
  const tableName = process.env.MOTION_TABLE;
  let batchRequest = {
    RequestItems: {
      [tableName]: []
    }
  };

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
      statusInfo.isPending = true;
    }

    let toAdd = {};
    Object.assign(toAdd, basicInfo, statusInfo);
    
    const toAddSize = sizeof(toAdd);
    const maxSize = process.env.DB_ITEM_MAX_SIZE;
    if (maxSize && toAddSize > maxSize) {
      console.warn("Stripping very large object with id " + toAdd.dok_id + " and size: " + toAddSize.toString());
      let strippedObj = docHelpers.parseBasicInfo(dok);
      strippedObj.isPending = toAdd.isPending;
      strippedObj.status = toAdd.status;
      console.log("New size: " + sizeof(strippedObj));
      toAddItems.push({PutRequest: {Item: strippedObj}});
    } else {
      toAddItems.push({PutRequest: {Item: toAdd}});
    }
  }

  batchRequest.RequestItems[tableName] = toAddItems;

  const nItems = batchRequest.RequestItems[tableName].length;
  if (nItems > 0) {
    console.log("Writing " + nItems + " items to DB.");
    return documentClient.batchWrite(batchRequest).promise();
  } else {
    console.log("No items to write for page, skipping");
    return new Promise((resolve, reject) => resolve());
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////

// Get result pages while they exist
async function getResults(urlString) {
  let nextUrl = urlString;
  let dbPromises = [];
  while (nextUrl != null) {
    try { 
      const jsonResp = await urlHelpers.getJsonFromUrl(nextUrl);
      const nextPage = jsonResp.dokumentlista['@nasta_sida'];
      if (nextPage != undefined && nextPage != "" && nextPage != nextUrl) {
        nextUrl = nextPage;
      } else {
        nextUrl = null;
      }

      if (jsonResp.dokumentlista.dokument != undefined && jsonResp.dokumentlista.dokument.length > 0) {
        const dbPromise = parseQueryResult(jsonResp);
        dbPromises.push(dbPromise);
      }
    } catch (error) {
      errorHelper.logError("Error when fetching url " + nextUrl + ": " + error);
      nextUrl = null;
    }
  }
  return Promise.all(dbPromises);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

async function _fetchMotions(_fromDate, _toDate) {
  const fromDate = _fromDate != null ? getDateString(_fromDate) : getDateString(process.env.DATE_ZERO);
  const toDate = _toDate != null ? getDateString(_toDate) : getDateString(Date.now());

  const motionRequestUrl = urlHelpers.getMotionQuery(fromDate, toDate);
  const propositionRequestUrl = urlHelpers.getPropositionQuery(fromDate, toDate);
  const result = Promise.all([getResults(motionRequestUrl), getResults(propositionRequestUrl)]);
  return result;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = async function fetchMotions(fromDateStrOverride = null, toDateStrOverride = null, callback) {
  const requestLogTableName = process.env.MOTION_REQUEST_LOG_TABLE;
  const requestLogQueryParams = {
    TableName: requestLogTableName,
    KeyConditionExpression: "id = :success",
    ExpressionAttributeValues: { ":success": "success" },
    ScanIndexForward: false,
    Limit: 1
  };

  // Check last successful fetch and fetch new
  let fetchFrom = moment(process.env.DATE_ZERO, 'YYYY-MM-DD').valueOf();
  try {
    const requestLogEmpty = await dynamoDb.describeTable({TableName: requestLogTableName}, async (err, data) => {
      return (err || data.Table.ItemCount === 0);
    });
    if (!requestLogEmpty) {
      fetchFrom = await documentClient.query(requestLogQueryParams).promise()
      .then(data => {
        console.log("FETCHING FROM: " + JSON.stringify(data.Items[0].date));
        return data.Count > 0 ? data.Items[0].date : null;
      })
      .catch(err => {
        errorHelper.logError("Failed to query log table " +
          process.env.MOTION_REQUEST_LOG_TABLE + "\nReason: " + err);
        return null;
      });
    }
  } catch (error) {
    errorHelper.logError("Unable to fetch request log entry. Error:\n" + error + "\nExiting.");
    return;
  }

  if (fromDateStrOverride != null) {
    fetchFrom = moment(fromDateStrOverride, 'YYYY-MM-DD').valueOf();
  }

  let fetchTo = null;
  if (toDateStrOverride != null) {
    fetchTo = moment(toDateStrOverride, 'YYYY-MM-DD').valueOf();
  }

  let fetchResp = {};
  // Do nothing if interval is zero
  if (fetchFrom != null && fetchFrom === fetchTo) {
    fetchResp = { statusCode: 200, body: "Interval is zero, nothing to fetch"};
  } else {
    fetchResp = await _fetchMotions(fetchFrom, fetchTo)
    .then(resp => {
      return { statusCode: 200, body: resp, nAdded: nItems };
    })
    .catch(err => {
      return { statusCode: 500, body: err};
    });
    logRequest(fetchResp.statusCode == 200, fetchTo);
  }

  console.log("Callback with response " + fetchResp.statusCode);
  callback(fetchResp.statusCode, fetchResp);
};
