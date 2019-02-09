import moment from "moment";
import config from "./config/config";
import httpResponses from "./httpResponses";
import lambdaClient from "./lambdaClient";
import { transformDocumentType } from "./models/DocumentType";
import { importQueueStatus } from "./scheduledJobs/ImportQueueStatus";
import { importSubscriptionServiceParliament } from "./scheduledJobs/ImportSubscriptionServiceParliament";
import { IPSParliamentDateRange } from "./scheduledJobs/IPSParliamentDateRange";
import { IPSParliamentUpdate } from "./scheduledJobs/IPSParliamentUpdate";

function hasParameter(event, parameter) {
  return event && event.queryStringParameters && event.queryStringParameters[parameter];
}

export const routeAdminStartImport = async (event, context) => {
  // Deduce date range and document type
  const fromDate = hasParameter(event, "fromDate")
    ? moment(event.queryStringParameters.fromDate)
    : moment().subtract(1, "year");
  const toDate = hasParameter(event, "toDate")
    ? moment(event.queryStringParameters.toDate)
    : moment();
  const documentType = hasParameter(event, "documentType")
    ? event.queryStringParameters.documentType
    : "mot";

  const requestParams = { fromDate, toDate, documentType };
  try {
    // InvocationType: Event <=> asynchronous execution of Lambda
    await lambdaClient.invoke({
      FunctionName: `${config.AWS_APPLICATION_NAME}-adminStartImport`,
      InvocationType: "Event",
      Payload: JSON.stringify(requestParams, null, 2)
    }).promise();
    return httpResponses.success({}, 202);
  } catch (error) {
    return httpResponses.error(error);
  }
};

export const adminStartImport = async (event, context) => {
  // Deduce date range and document type
  const fromDate = event.fromDate ? moment(event.fromDate) : moment().subtract(1, "year");
  const toDate = event.toDate ? moment(event.toDate) : moment();
  const docTypeStr = event.documentType || "mot";
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

export const routeStartUpdateImport = async (event, context) => {
  // Default update to start from one day ago.
  // If this is a post request with a query parameter, use it.
  const fromDate = hasParameter(event, "fromDate") ?
    moment(event.queryStringParameters.fromDate) : moment().subtract(1, "day");

  const documentType = hasParameter(event, "documentType") ?
    event.queryStringParameters.documentType : "mot";

  const requestParams = { fromDate, documentType };
  try {
    // InvocationType: Event <=> asynchronous execution of Lambda
    await lambdaClient.invoke({
      FunctionName: `${config.AWS_APPLICATION_NAME}-adminStartUpdateImport`,
      InvocationType: "Event",
      Payload: JSON.stringify(requestParams, null, 2)
    }).promise();
    return httpResponses.success({}, 202);
  } catch (error) {
    return httpResponses.error(error);
  }
};

export const startUpdateImport = async (event, context) => {
  // Default update to start from one day ago.
  const fromDate = event.fromDate ? moment(event.fromDate) : moment().subtract(1, "day");
  const docType = transformDocumentType(event.documentType || "mot");

  // Run import job
  try {
    const ipsParliamentUpdate = new IPSParliamentUpdate(docType);
    await ipsParliamentUpdate.start(fromDate);
    return httpResponses.success({}, 202);
  } catch (error) {
    return httpResponses.error(error);
  }
};

export const handleImportQueueEvent = async (event, context) => {
  try {
    await importSubscriptionServiceParliament.processEvent(event);
    return httpResponses.success({}, 202);
  } catch (error) {
    return httpResponses.error(error);
  }
};

export const logQueueStatus = (event, context) => {
  importQueueStatus.logStatus();
};
