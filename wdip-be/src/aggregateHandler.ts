import moment from "moment";
import StakeholderAggregator from "./aggregateJobs/StakeholderAggregator";
import httpResponses from "./httpResponses";

function isValidDateString(inStr?: string): boolean {
    if (!inStr) { return false; }
    const inMoment = moment(inStr, "YYYY-MM-DD");
    return inMoment.isValid();
}

/**
 * Scroll through all documents and link stakeholders to each other
 * based on documents where they are listed together
 */
export const aggregateStakeholders = async (event, context: any) => {
    const scrollId = event.scrollId;
    const fromDate = isValidDateString(event.fromDate) ?
        moment(event.fromDate, "YYYY-MM-DD") : moment().subtract(1, "day");
    const toDate = isValidDateString(event.toDate) ?
        moment(event.toDate, "YYYY-MM-DD") : moment();

    console.log(`Parameters: ${fromDate}, ${toDate}, ${scrollId}`);
    const aggregator = new StakeholderAggregator(fromDate, toDate, scrollId);

    try {
        const continueId = await aggregator.start();
        return httpResponses.success({ data: continueId });
    } catch (error) {
        return httpResponses.error(error);
    }
};
