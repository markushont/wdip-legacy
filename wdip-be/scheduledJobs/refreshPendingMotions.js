// Check status for motions with isPending=true

var AWS = require('aws-sdk');
var errorHelper = require('./errorHelper');
const docHelpers = require('./docHelpers');
const urlHelpers = require('./urlHelpers');

// Point to local DB instance
if (process.env.IS_OFFLINE || process.env.IS_LOCAL) {
    AWS.config.update({
      region: "eu-west-1",
      endpoint: "http://localhost:8000"
    });
  }

var documentClient = new AWS.DynamoDB.DocumentClient();

///////////////////////////////////////////////////////////////////////////////////////////////////

async function updateStatus(docId) {
  let putParams = {
    TableName: process.env.MOTION_TABLE,
    Key: { dok_id: docId },
    AttributeUpdates: {}
  };

  const statusUrl = urlHelpers.getDocStatusQuery(docId);
  try {
    const statusResp = await urlHelpers.getJsonFromUrl(statusUrl);
    const statusInfo = docHelpers.parseStatusObj(statusResp.dokumentstatus);
    if (!statusInfo.isPending) {
      for (var key in statusInfo) {
        if (statusInfo.hasOwnProperty(key) && statusInfo[key]) {
          putParams.AttributeUpdates[key] = {
            Action: "PUT",
            Value: statusInfo[key]
          };
        }
      }

      // explicitly delete pending flag
      putParams.AttributeUpdates.isPending = { Action: "DELETE"};
      return documentClient.update(putParams).promise();
    } else {
      console.log("Nothing to update for dok " + docId);
      return null;
    }
  } catch (error) {
    const errorText = "Could not fetch status for url " + statusUrl +
      "\n Reason: " + error;
    throw errorText;
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = async function refreshPendingMotions(callback) {
  const pendingDocsQueryparams = {
    TableName: process.env.MOTION_TABLE,
    IndexName : process.env.PENDING_INDEX,
    KeyConditionExpression: "isPending = :pending",
    ExpressionAttributeValues: { ":pending": "x" },
  };

  let pendingItems = [];
  try {
    pendingItems = await documentClient.query(pendingDocsQueryparams).promise()
    .then(data => {
      console.log("NUMBER OF ITEMS FOUND: " + data.Count);
      return data.Count > 0 ? data.Items : [];
    });
  } catch (err) {
      errorHelper.logError("Error when querying DB for pending docs: " + err);
  }

  let putPromises = [];
  for (const item of pendingItems) {
    try {
      putPromises.push(updateStatus(item.dok_id));
    } catch (error) {
      errorHelper.logError(error);
    }
  }

  try {
    let updatedDocs = await Promise.all(putPromises)
    .then(data => {
      return data.map(item => {
        if (item) return true;
        else return false;
      })
    });

    console.log("Updated " + updatedDocs.length + " documents");
    callback(200);
  } catch (error) {
    callback(500);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////