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
        if (statusInfo.hasOwnProperty(key)) {
          putParams.AttributeUpdates[key] = {};
          putParams.AttributeUpdates[key].Action = "PUT";
          putParams.AttributeUpdates[key].Value = statusInfo[key];
        }
      }

      // delete pending flag
      putParams.AttributeUpdates.isPending = { Action: "DELETE"};
    } else {
      return new Promise((resolve, reject) => resolve(true));
    }

    return documentClient.update(putParams).promise()
    .then(data => {
      return true;
    })
    .catch (err => {
      return false;
    });
  } catch (error) {
    errorHelper.logError("Could not fetch status for url " + statusUrl +
      "\n Reason: " + error);
    return new Promise((resolve, reject) => reject());
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
    putPromises.push(updateStatus(item.dok_id));
  }
  await Promise.all(putPromises)
  .then(data => {
    let updated = data.filter(item => { return item });
    callback(200, "Updated " + updated.length + " items.");
  })
  .catch(err => {
    errorHelper.logError(err);
    callback(500, "The following error occured: " + err);
  });

  console.error(errorHelper.getLoggedErrors());
}

///////////////////////////////////////////////////////////////////////////////////////////////////