"use strict";

import { importQueueStatus } from "./scheduledJobs/ImportQueueStatus";
import { ipsParliamentUpdate } from "./scheduledJobs/IPSParliamentUpdate";
import moment from "moment";

module.exports.logQueueStatus = (event, context) => {
  importQueueStatus.logStatus();
};

module.exports.startUpdateImport = async (event, context) => {
  const fromDate = moment().subtract(1, "day");
  ipsParliamentUpdate.start(fromDate);
};
