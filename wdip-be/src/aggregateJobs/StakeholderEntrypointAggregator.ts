import { SearchParams } from "elasticsearch";
import { Moment } from "moment";
import config from "../config/config";
import dbClient from "../dbclient";
import logger from "../logger";
import { ParliamentDocument } from "../models/ParliamentDocument";
import StakeholderAggregator from "./StakeholderAggregator";

export default class StakeholderEntrypointAggregator extends StakeholderAggregator {

    private fromDate: string;
    private toDate: string;

    /**
     * @param fromDate beginning of date range (for the 'published' field)
     * @param toDate end of date range (for the 'published' field)
     */
    constructor(fromDate: Moment, toDate: Moment) {
        super();
        if (!fromDate.isValid() || !toDate.isValid()) {
            throw new Error(`StakeholderEntrypointAggregator: Invalid fromDate ${fromDate} and/or toDate ${toDate}`);
        }
        this.fromDate = fromDate.format(this.DATE_FORMAT);
        this.toDate = toDate.format(this.DATE_FORMAT);
    }

    public setFromDate(fromDate: Moment) { this.fromDate = fromDate.format(this.DATE_FORMAT); }
    public setToDate(toDate: Moment) { this.toDate = toDate.format(this.DATE_FORMAT); }

    protected async startInternal() {
        return await this.scrollStakeholders(this.fromDate, this.toDate);
    }

    /**
     * Initiate search for all ParliamentDocuments within date range and parse
     * stakeholders. If results are paginated with a scrollId then continue search
     * @param fromDate beginning of date range
     * @param toDate end of date range
     */
    private async scrollStakeholders(fromDate: string, toDate: string) {
        const params: SearchParams = {
            index: config.WDIP_MOTION_INDEX,
            scroll: "20h",
            body: {
                _source: ["stakeholders", "id"],
                query: {
                    range: {
                        published: {
                            gte: fromDate,
                            lte: toDate
                        }
                    }
                }
            }
        };
        try {
            const response = await dbClient.search<ParliamentDocument>(params);
            logger.debug(`Found ${response.hits.hits.length} documents.`);
            const documents = response.hits.hits.map((doc) => doc._source);
            if (documents.length) {
                await this.parseStakeholders(documents);
                return { scrollId: response._scroll_id };
            } else {
                return {};
            }
        } catch (error) {
            throw error;
        }
    }
}
