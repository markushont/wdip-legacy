import { importSubscriptionServiceParliament } from "./api/admin/ImportSubscriptionServiceParliament";
const logger = require("./logger");

module.exports.importQueueEvent = async (event, context) => {
    importSubscriptionServiceParliament.processEvent(event);
};
