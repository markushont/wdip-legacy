"use strict";

const dbClient = require("../dbclient");
const {
  WDIP_MOTION_INDEX,
} = require("../config/config");

const {
  WDIP_DEFAULT_PARTIES,
  WDIP_ACCEPTED,
  WDIP_REJECTED,
  WDIP_PARTIALLY_ACCEPTED
} = require("../config/constants");

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
                term: { "status": outcome }
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
  fromDateStrOverride,
  toDateStrOverride) {

  var parties = WDIP_DEFAULT_PARTIES;

  const posResponse = getMotions(fromDateStrOverride, toDateStrOverride, WDIP_ACCEPTED, parties);
  const negResponse = getMotions(fromDateStrOverride, toDateStrOverride, WDIP_REJECTED, parties);
  const partiallyAcceptedResponse =
    getMotions(fromDateStrOverride, toDateStrOverride, WDIP_PARTIALLY_ACCEPTED, parties);
  const responseQueue = await Promise.all([posResponse, negResponse, partiallyAcceptedResponse]);
  var i = 0;
  var partyData = [];
  parties.forEach((party) => {
    const approved = responseQueue[0].responses[i].hits.total;
    const declined = responseQueue[1].responses[i].hits.total;
    const partiallyAccepted = responseQueue[2].responses[i].hits.total;
    partyData.push({
      party: party,
      submitted: approved + declined + partiallyAccepted,
      approved: approved,
      declined: declined,
      partiallyAccepted: partiallyAccepted
    });
    i++;
  });
  return { fromDate: fromDateStrOverride, toDate: toDateStrOverride, results: partyData };

}

module.exports = getMotionsByParty;
