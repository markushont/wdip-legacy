import { importQueueStatus } from "./scheduledJobs/ImportQueueStatus";
import { importSubscriptionServiceParliament } from "./scheduledJobs/ImportSubscriptionServiceParliament";
import { ipsParliamentDateRange } from "./scheduledJobs/IPSParliamentDateRange";
import { ipsParliamentUpdate } from "./scheduledJobs/IPSParliamentUpdate";
import moment from "moment";

module.exports.adminStartImport = async (event, context) => {
  const fromDate = moment(event.queryStringParameters.fromDate);
  const toDate = moment(event.queryStringParameters.toDate);
  ipsParliamentDateRange.start(fromDate, toDate);
  return responses.success({}, 202);
};

module.exports.startUpdateImport = async (event, context) => {
  const fromDate = moment().subtract(1, "day");
  ipsParliamentUpdate.start(fromDate);
};

module.exports.handleImportQueueEvent = async (event, context) => {
  importSubscriptionServiceParliament.processEvent(event);
};

module.exports.logQueueStatus = (event, context) => {
  importQueueStatus.logStatus();
};
