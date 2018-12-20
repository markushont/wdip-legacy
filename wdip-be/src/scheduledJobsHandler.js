"use strict";

import { importQueueStatus } from "./scheduledJobs/ImportQueueStatus";

module.exports.queueStatus = (event, context) => {
  importQueueStatus.logStatus();
};
