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

  const dbClient = require('../dbclient');
  const { WDIP_MOTION_INDEX } = require('../config/config');
  const logger = require('../logger');

///////////////////////////////////////////////////////////////////////////////////////////////////

async function updateStatus(docId) {
  let putParams = {
    index: process.env.MOTION_TABLE,
    type: "_doc",
    id: docId,
    body: {doc:{}}
  };

  const statusUrl = urlHelpers.getDocStatusQuery(docId);
  try {
    const statusResp = await urlHelpers.getJsonFromUrl(statusUrl);
    const statusInfo = docHelpers.parseStatusObj(statusResp.dokumentstatus);
    if (!statusInfo.isPending) {
      for (var key in statusInfo) {
        if (statusInfo.hasOwnProperty(key) && statusInfo[key]) {
          putParams.body.doc[key] =  statusInfo[key];

        }
      }
      return dbClient.update(putParams);
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

  //alla pending
  const pendingDocsQueryparams = {
    index: process.env.MOTION_TABLE,
    q: 'isPending:true',
    size:'30'
  };

  let pendingItems = [];
  try {
    pendingItems = await dbClient.search(pendingDocsQueryparams)
    .then(data => {
      console.log("NUMBER OF ITEMS FOUND: " + data.hits.total);
      return data.hits.total > 0 ? data.hits : [];
    });
  } catch (err) {
      errorHelper.logError("Error when querying DB for pending docs: " + err);
  }

  let putPromises = [];
  for (var i=0; i<pendingItems.total; i++) {
    try {
      putPromises.push(updateStatus(pendingItems.hits[i]._source.dok_id));
    } catch (error) {
      errorHelper.logError(error);
    }
  }

  var updatedDocs=0;
  try {
    await Promise.all(putPromises)
    .then(data => {
      return data.map(item => {
        item.result=="updated" ? i++ : false;
      })
    });

    console.log("Updated " + updatedDocs + " documents");
    callback(200);
  } catch (error) {
    console.log("err:",error);
    callback(500);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
