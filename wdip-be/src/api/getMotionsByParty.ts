"use strict";

import config from "../config/config";
import dbClient from "../dbclient";
import logger from "../logger";
import { DocumentStatus as status } from "../models/DocumentStatus";

async function getMotions(outcome: string,
                          parties: string[],
                          fromDateStrOverride?: string,
                          toDateStrOverride?: string) {
  const toAddDocs = [];
  parties.forEach((party) => {
    toAddDocs.push({
      index: config.WDIP_MOTION_INDEX,
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
                term: { status: outcome }
              },
              {
                range: {
                  dateStr: {
                    gte: fromDateStrOverride,
                    lte: toDateStrOverride
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

export default async function getMotionsByParty(fromDateStrOverride?: string, toDateStrOverride?: string) {

  const parties = config.WDIP_DEFAULT_PARTIES;

  const posResponse = getMotions(status.APPROVED, parties, fromDateStrOverride, toDateStrOverride);
  const negResponse = getMotions(status.REJECTED, parties, fromDateStrOverride, toDateStrOverride);
  const partiallyAcceptedResponse =
    getMotions(status.APPROVED_PARTIALLY, parties, fromDateStrOverride, toDateStrOverride);
  const responseQueue = await Promise.all([posResponse, negResponse, partiallyAcceptedResponse]);

  let i = 0;
  const partyData = [];
  parties.forEach((party) => {
    const approved = responseQueue[0].responses[i].hits.total;
    const declined = responseQueue[1].responses[i].hits.total;
    const partiallyAccepted = responseQueue[2].responses[i].hits.total;
    partyData.push({
      party,
      submitted: approved + declined + partiallyAccepted,
      approved,
      declined,
      partiallyAccepted
    });
    i++;
  });
  return { fromDate: fromDateStrOverride, toDate: toDateStrOverride, results: partyData };

}
