// Fetch motions from Riksdagen API and insert into DB

'use strict';

var AWS = require('aws-sdk');
var moment = require('moment');
const request = require('request');
const urlHelpers = require('./urlHelpers');
const docHelpers = require('./docHelpers');

// Point to local DB instance
if (process.env.IS_LOCAL) {
  AWS.config.update({
    region: "eu-central-1",
    endpoint: "http://localhost:8000"
  });
}

var dynamodb = new AWS.DynamoDB();

///////////////////////////////////////////////////////////////////////////////////////////////////

// Add entry to request log
function logRequest(isSuccess, fetchedToStr) {
  var id = isSuccess ? "success" : "fail";
  var date = (fetchedToStr != null) ?
    moment(fetchedToStr, 'YYYY-MM-DD').valueOf().toString() :
    moment().valueOf().toString();
  var toPut = {
    Item: {
      id:   { S: id },
      date: { N: date }
    },
    ReturnConsumedCapacity: "TOTAL",
    TableName: process.env.MOTION_REQUEST_LOG_TABLE
  };

  dynamodb.putItem(toPut, function(err, data) {
    if (err) console.log(err);
    else console.log(data);
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function getDateString(dateInt) {
  if (dateInt === null || dateInt === undefined) return null;

  var date = moment(dateInt);
  return date.format('YYYY-MM-DD');
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function getJsonFromUrl(urlString) {
  return new Promise((resolve, reject) => {
    console.log("Fetching url " + urlString);
    request(urlString, (error, response, body) => {
      if (error) reject(error);
      if (response.statusCode != 200) {
        reject('Invalid status code <' + response.statusCode + '>');
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject('Invalid JSON in response from url ' + urlString);
      }
    });
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// Parse results and put to db
async function parseQueryResult(data) {
  var batchRequest = {
    RequestItems: {
      [process.env.MOTION_TABLE]: []
    }
  };

  await Promise.all(data.dokumentlista.dokument.map(async (dok) => {
    // Add basic info
    var toAdd = {
      dok_id:     { S: dok.dok_id },
      date:       { N: moment(dok.datum, "YYYY-MM-DD").valueOf().toString() },
      dateStr:    { S: dok.datum },
      doktyp:     { S: dok.doktyp },
      subtyp:     { S: dok.subtyp },
      titel:      { S: dok.sokdata.titel },
      undertitel: { S: dok.sokdata.undertitel },
      summary:    { S: dok.summary }
    };

    // Fetch status and parse
    var statusUrl = urlHelpers.getDocStatusQuery(dok.dok_id);
    const statusResp = await getJsonFromUrl(statusUrl);
    const statusObj = statusResp.dokumentstatus;

    toAdd.forslag = docHelpers.parseForslag(statusObj.dokforslag);
    toAdd.intressent = docHelpers.parseIntressent(statusObj.dokintressent);
    toAdd.uppgift = docHelpers.parseUppgift(statusObj.dokuppgift);

    var isPending = false;
    if (toAdd.status != undefined) {
      const status = statusObj.dokument.status;
      toAdd.status = { S: status };
      isPending = status != "Klar" && status != "ocr";
    } else if (statusObj.dokforslag != undefined) {
      // Check status of sub-proposals
      for (var i = 0; i < statusObj.dokforslag.forslag.length(); ++i) {
        var item = statusObj.dokforslag.forslag[i];
        if (item.utskottet === "Avslag" || item.kammaren === "Bifall" ||
          item.utskottet === "Bifall" || item.kammaren === "Avslag") {
          continue;
        }
        isPending = true;
        break;
      }
    }
    toAdd.isPending = { B: isPending.toString() };

    batchRequest.RequestItems[process.env.MOTION_TABLE].push({
      PutRequest: { Item: toAdd }
    });
  }))

  console.log(batchRequest.RequestItems);

  return dynamodb.batchWriteItem(batchRequest).promise();
}

///////////////////////////////////////////////////////////////////////////////////////////////////

// Get result pages while they exist
async function getResults(urlString) {
  var nextUrl = urlString;
  var dbPromises = [];
  while (nextUrl != null) {
    try {
      const jsonResp = await getJsonFromUrl(nextUrl);
      var nextPage = jsonResp.dokumentlista['@nasta_sida'];
      if (nextPage != undefined && nextPage != "" && nextPage != nextUrl) nextUrl = nextPage;
      else nextUrl = null;

      if (jsonResp.dokumentlista.dokument != undefined) {
        var dbPromise = parseQueryResult(jsonResp);
        dbPromises.push(dbPromise);
      }
    } catch (error) {
      console.log("Error when fetching url " + nextUrl + ": " + error);
      nextUrl = null;
    }
  }
  return Promise.all(dbPromises);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

async function _fetchMotions(_fromDate, _toDate) {
  var response = {};
  var fromDate = _fromDate != null ? getDateString(_fromDate) : getDateString(0);
  var toDate = _toDate != null ? getDateString(_toDate) : getDateString(Date.now());

  var motionRequestUrl = urlHelpers.getMotionQuery(fromDate, toDate);
  var propositionRequestUrl = urlHelpers.getPropositionQuery(fromDate, toDate);
  await Promise.all([getResults(motionRequestUrl), getResults(propositionRequestUrl)]);

  response.status = 200; // TODO: improve
  return response;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = async function fetchMotions(fromDateStrOverride = null, toDateStrOverride = null) {
  const requestLogQueryParams = {
    TableName: process.env.MOTION_REQUEST_LOG_TABLE,
    KeyConditionExpression: "id = :success",
    ExpressionAttributeValues: { ":success": {S: "success" }},
    ScanIndexForward: false,
    Limit: 1
  };

  // Check last successful fetch and fetch new
  dynamodb.query(requestLogQueryParams, async function(err, data) {
    var response = {};
    if (err) {
      //console.log(err);
      console.log(process.env.MOTION_REQUEST_LOG_TABLE);
      response = { statusCode: 500, body: "Unable to access query log"};
    }
    else {
      var fetchFrom = data.Count > 0 ? data.Items[0].date : null;
      if (fromDateStrOverride != null)
        fetchFrom = moment(fromDateStrOverride, 'YYYY-MM-DD');
      var fetchTo = null;
      if (toDateStrOverride != null)
        fetchTo = moment(toDateStrOverride, 'YYYY-MM-DD');

      // Do nothing if interval is zero
      if (fetchFrom != null && fetchFrom === fetchTo) {
        return {};
      } else {
        response = await _fetchMotions(fetchFrom, fetchTo);
        if (response.status === 200) logRequest(true, fetchTo);
      }
    }
    return response;
  });
};
