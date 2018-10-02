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

module.exports = async function refreshPendingMotions(callback) {
  const motionTableName = process.env.MOTION_TABLE;
  const indexName = process.env.PENDING_INDEX;
  const pendingDocsQueryparams = {
    TableName: motionTableName,
    IndexName : indexName,
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

  console.log("Found " + pendingItems.length + " items.");
}