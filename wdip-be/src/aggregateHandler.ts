import moment from "moment";
import StakeholderContinueAggregator from "./aggregateJobs/StakeholderContinueAggregator";
import StakeholderEntrypointAggregator from "./aggregateJobs/StakeholderEntrypointAggregator";
import logger from "./logger";

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
    // First check if we're continuing an ongoing aggregation
    if (event.scrollId) {
        logger.debug(`Invoking with param scrollId: ${event.scrollId}`);
        try {
            const continueAgg = new StakeholderContinueAggregator(event.scrollId);
            const continueAggResp = await continueAgg.start();
            return { statusCode: 200, body: continueAggResp };
        } catch (error) {
            return { statusCode: 500, body: { error } };
        }
    }

    const fromDate = isValidDateString(event.fromDate) ?
        moment(event.fromDate, "YYYY-MM-DD") : moment().subtract(1, "day");
    const toDate = isValidDateString(event.toDate) ?
        moment(event.toDate, "YYYY-MM-DD") : moment();

    logger.debug(`Invoking with params fromDate: ${fromDate}, toDate: ${toDate}`);
    try {
        const entrypointAgg = new StakeholderEntrypointAggregator(fromDate, toDate);
        let entrypointAggResp = await entrypointAgg.start();
        if (entrypointAggResp.scrollId && event.continueScroll && entrypointAgg.remainingExecutionTime > 30) {
            const continueEntryAgg = new StakeholderContinueAggregator(entrypointAggResp.scrollId);
            entrypointAggResp = await continueEntryAgg.start();
        }
        return { statusCode: 200, body: entrypointAggResp };
    } catch (error) {
        return { statusCode: 500, body: error };
    }
};
