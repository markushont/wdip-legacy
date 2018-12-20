import { importSubscriptionServiceParliament } from "./scheduledJobs/ImportSubscriptionServiceParliament";

module.exports.handleImportQueueEvent = async (event, context) => {
    importSubscriptionServiceParliament.processEvent(event);
};
