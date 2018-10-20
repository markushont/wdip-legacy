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
    index: WDIP_MOTION_INDEX,
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
      putParams.body.doc["isPending"] = false;
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
var putPromises = [];
  dbClient.search({
    index: WDIP_MOTION_INDEX,
    scroll: '10s',
    q: 'isPending:true'
  }, async function getMoreUntilDone(error, response) {
    response.hits.hits.forEach(function (hit) {
      putPromises.push(updateStatus(hit._source.dok_id));
    });

    if (response.hits.total !== putPromises.length) {
      dbClient.scroll({
        scrollId: response._scroll_id,
        scroll: '10s'
      }, getMoreUntilDone);
    } else {
      try {
        let updatedDocs = await Promise.all(putPromises)
        .then(data => {
          return data.map(item => {
            if(item.result == "updated") return true;
            else return false;
          })
        });

        console.log("Updated " + updatedDocs.length + " documents");
        callback(200);
      } catch (error) {
        console.log("err:",error);
        callback(500);
      }
    }
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////
