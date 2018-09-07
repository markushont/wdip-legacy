// Fetch motions from Riksdagen API and insert into DB

'use strict';

var AWS = require('aws-sdk');
var moment = require('moment');
const request = require('request');
var sizeof = require('object-sizeof');
const urlHelpers = require('./urlHelpers');
const docHelpers = require('./docHelpers');

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

// Log errors
var loggedErrors = [];
function logError(errorText) {
  console.error(errorText);
  loggedErrors.push(errorText);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// Add entry to request log
function logRequest(isSuccess, fetchedTo) {
  var id = isSuccess ? "success" : "fail";
  var date = (fetchedTo != null) ? fetchedTo : moment().valueOf();
  var toPut = {
    Item: {
      id: id,
      date: date,
      errors: loggedErrors
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

  var date = moment(dateInt);
  return date.format('YYYY-MM-DD');
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/* Http fetch from URL encoded string */
function getJsonFromUrl(urlString) {
  console.log("Fetching URL: " + urlString);
  return new Promise((resolve, reject) => {
    request(urlString, (error, response, body) => {
      if (error) reject(error);
      if (!response) reject("Undefined response from URL " + urlString);
      if (response.statusCode != 200) {
        reject('Invalid status code <' + response.statusCode + '>');
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        logError('Invalid JSON in response from url ' + urlString);
        reject('Invalid JSON in response from url ' + urlString);
      }
    });
  }, 2000);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// Parse results and put to db
async function parseQueryResult(data) {
  const tableName = process.env.MOTION_TABLE;
  var batchRequest = {
    RequestItems: {
      [tableName]: []
    }
  };

  var toAddItems = [];
  for (const dok of data.dokumentlista.dokument) {
    // Add basic info
    if (dok === undefined || !dok.dok_id || typeof dok.dok_id != 'string') {
      console.log("Invalid document id " + dok.dok_id + ", skipping.");
    } else {
      var toAdd = docHelpers.parseBasicInfo(dok);

      // Fetch status and parse
      var statusUrl = urlHelpers.getDocStatusQuery(dok.dok_id);
      try {
        const statusResp = await getJsonFromUrl(statusUrl);
        const statusObj = statusResp.dokumentstatus;

        toAdd.forslag = docHelpers.parseForslag(statusObj.dokforslag);
        toAdd.intressent = docHelpers.parseIntressent(statusObj.dokintressent);
        toAdd.uppgift = docHelpers.parseUppgift(statusObj.dokuppgift);
        toAdd.status = docHelpers.parseStatus(statusObj.dokument);

        if (toAdd.status === "Klar" || toAdd.status === "ocr") {
          toAdd.isPending = false;
        } else {
          toAdd.isPending = docHelpers.parsePending(statusObj.dokument);
        }
      } catch (error) {
        logError("Could not fetch status for url " + statusUrl +
        "\n Reason: " + error);
        toAdd.isPending = true;
      }

      const toAddSize = sizeof(toAdd);
      const maxSize = process.env.DB_ITEM_MAX_SIZE;
      if (maxSize && toAddSize > maxSize) {
        console.warn("Stripping very large object with id " + toAdd.dok_id + " and size: " + toAddSize.toString());
        var strippedObj = docHelpers.parseBasicInfo(dok);
        strippedObj.isPending = toAdd.isPending;
        strippedObj.status = toAdd.status;
        toAddItems.push({PutRequest: {Item: strippedObj}});
        console.log("New size: " + sizeof(strippedObj));
      } else {
        toAddItems.push({PutRequest: {Item: toAdd}});
      }
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
  var nextUrl = urlString;
  var dbPromises = [];
  while (nextUrl != null) {
    try {
      const jsonResp = await getJsonFromUrl(nextUrl);
      var nextPage = jsonResp.dokumentlista['@nasta_sida'];
      if (nextPage != undefined && nextPage != "" && nextPage != nextUrl) nextUrl = nextPage;
      else {
        nextUrl = null;
      }

      if (jsonResp.dokumentlista.dokument != undefined && jsonResp.dokumentlista.dokument.length > 0) {
        var dbPromise = parseQueryResult(jsonResp);
        dbPromises.push(dbPromise);
      }
    } catch (error) {
      logError("Error when fetching url " + nextUrl + ": " + error);
      nextUrl = null;
    }
  }
  return Promise.all(dbPromises);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

async function _fetchMotions(_fromDate, _toDate) {
  var fromDate = _fromDate != null ? getDateString(_fromDate) : getDateString(process.env.DATE_ZERO);
  var toDate = _toDate != null ? getDateString(_toDate) : getDateString(Date.now());

  var motionRequestUrl = urlHelpers.getMotionQuery(fromDate, toDate);
  var propositionRequestUrl = urlHelpers.getPropositionQuery(fromDate, toDate);
  var result = Promise.all([getResults(motionRequestUrl), getResults(propositionRequestUrl)]);
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
  var fetchFrom = moment(process.env.DATE_ZERO, 'YYYY-MM-DD').valueOf();
  try {
    var requestLogEmpty = await dynamoDb.describeTable({TableName: requestLogTableName}, async (err, data) => {
      return (err || data.Table.ItemCount === 0);
    });
    if (!requestLogEmpty) {
      fetchFrom = await documentClient.query(requestLogQueryParams).promise()
      .then(data => {
        console.log("FETCHING FROM: " + JSON.stringify(data.Items[0].date));
        return data.Count > 0 ? data.Items[0].date : null;
      })
      .catch(err => {
        logError("Failed to query log table " +
        process.env.MOTION_REQUEST_LOG_TABLE + "\nReason: " + err);
        return null;
      });
    }
  } catch (error) {
    logError("Unable to fetch request log entry. Error:\n" + error + "\nExiting.");
    return;
  }

  if (fromDateStrOverride != null) {
    fetchFrom = moment(fromDateStrOverride, 'YYYY-MM-DD').valueOf();
  }

  var fetchTo = null;
  if (toDateStrOverride != null) {
    fetchTo = moment(toDateStrOverride, 'YYYY-MM-DD').valueOf();
  }

  var fetchResp = {};
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
