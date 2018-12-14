import { importSubscriptionServiceParliament } from "./scheduledJobs/ImportSubscriptionServiceParliament";

module.exports.importQueueEvent = async (event, context) => {
    importSubscriptionServiceParliament.processEvent(event);
};
