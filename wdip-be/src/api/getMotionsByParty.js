"use strict";

const dbClient = require("../dbclient");
const { WDIP_MOTION_INDEX, WDIP_DEFAULT_PARTIES } = require("../config/config");

const logger = require("../logger");

async function getMotions(fromDateStrOverride = null, toDateStrOverride = null, outcome, parties) {
  var toAddDocs = [];
  parties.forEach((party) => {
    toAddDocs.push({
      index: WDIP_MOTION_INDEX,
      type: "_doc",
      size: "0"
    });
    toAddDocs.push(
      {
        query: {
          bool: {
            must: [
              {
                term: { "intressent.partibet": party }
              },
              {
                term: { "forslag.kammaren": outcome }
              },
              {
                range: {
                  "dateStr": {
                    "gte": fromDateStrOverride,
                    "lte": toDateStrOverride
                  }
                }
              }
            ]
          }
        }
      });
  });
  try {
    return dbClient.msearch({
      body: toAddDocs
    });
  } catch (error) {
    logger.error("Error fetching documents in getMotions: ", error);
  }
}

async function getMotionsByParty(
  fromDateStrOverride = new Date(2000, 0, 1),
  toDateStrOverride = new Date(2018, 0, 1),
  parties = WDIP_DEFAULT_PARTIES) {
  const posResponse = getMotions(fromDateStrOverride, toDateStrOverride, "bifall", parties);
  const negResponse = getMotions(fromDateStrOverride, toDateStrOverride, "avslag", parties);
  const responseQueue = await Promise.all([posResponse, negResponse]);
  var i = 0;
  var partyData = [];
  parties.forEach((party) => {
    const approved = responseQueue[0].responses[i].hits.total;
    const declined = responseQueue[1].responses[i].hits.total;
    partyData.push({ party: party, submitted: approved + declined, approved: approved, declined: declined });
    i++;
  });
  return { fromDate: fromDateStrOverride, toDate: toDateStrOverride, results: partyData };

}

module.exports = getMotionsByParty;
