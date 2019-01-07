import moment from "moment";
import httpResponses from "./httpResponses";
import { transformDocumentType } from "./models/DocumentType";
import { importQueueStatus } from "./scheduledJobs/ImportQueueStatus";
import { importSubscriptionServiceParliament } from "./scheduledJobs/ImportSubscriptionServiceParliament";
import { IPSParliamentDateRange } from "./scheduledJobs/IPSParliamentDateRange";
import { IPSParliamentUpdate } from "./scheduledJobs/IPSParliamentUpdate";

function hasParameter(event, parameter) {
  return event && event.queryStringParameters && event.queryStringParameters[parameter];
}

module.exports.adminStartImport = async (event, context) => {
  // Deduce date range and document type
  const fromDate = hasParameter(event, "fromDate") ?
    moment(event.queryStringParameters.fromDate) :
    moment().subtract(1, "year");
  const toDate = hasParameter(event, "toDate") ?
    moment(event.queryStringParameters.toDate) :
    moment();
  const docTypeStr = hasParameter(event, "documentType") ?
    event.queryStringParameters.documentType :
    "mot";
  const documentType = transformDocumentType(docTypeStr);

  // Run import job
  try {
    const ipsParliamentDateRange = new IPSParliamentDateRange(documentType);
    await ipsParliamentDateRange.start(fromDate, toDate);
    return httpResponses.success({}, 202);
  } catch (error) {
    return httpResponses.error(error);
  }
};

module.exports.startUpdateImport = async (event, context) => {
  // Default update to start from one day ago.
  // If this is a post request with a query parameter, use it.
  const fromDate = hasParameter(event, "fromDate") ?
    moment(event.queryStringParameters.fromDate) :
    moment().subtract(1, "day");

  let docTypeStr = "mot";
  if (hasParameter(event, "documentType")) { // invoked via http post
    docTypeStr = event.queryStringParameters.documentType;
  } else if (event && event.documentType) { // invoked via cron
    docTypeStr = event.documentType;
  }
  const docType = transformDocumentType(docTypeStr);

  // Run import job
  try {
    const ipsParliamentUpdate = new IPSParliamentUpdate(docType);
    await ipsParliamentUpdate.start(fromDate);
    return httpResponses.success({}, 202);
  } catch (error) {
    return httpResponses.error(error);
  }
};

module.exports.handleImportQueueEvent = async (event, context) => {
  try {
    await importSubscriptionServiceParliament.processEvent(event);
    return httpResponses.success({}, 202);
  } catch (error) {
    return httpResponses.error(error);
  }
};

module.exports.logQueueStatus = (event, context) => {
  importQueueStatus.logStatus();
};
