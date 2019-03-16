import { SearchResponse } from "elasticsearch";
import dbClient from "../dbclient";
import { ParliamentDocument } from "../models/ParliamentDocument";
import StakeholderAggregator from "./StakeholderAggregator";

export default class StakeholderContinueAggregator extends StakeholderAggregator {

    private scrollId: string;

    /**
     * @param scrollId pagination cursor for previous search
     */
    constructor(scrollId: string) {
        super();
        if (!scrollId || !scrollId.length) {
            throw new Error(`StakeholderContinueAggregator: Invalid scrollId ${scrollId}`);
        }
        this.scrollId = scrollId;
    }

    public setScrollId(scrollId: string) { this.scrollId = scrollId; }

    protected async startInternal() {
        return await this.continueScrollStakeholders(this.scrollId);
    }

    protected async continueScrollStakeholders(scrollId: string) {
        try {
            const response: SearchResponse<ParliamentDocument> = await dbClient.scroll<ParliamentDocument>({
                scrollId,
                scroll: "20h"
            });
            if (response.hits.hits && response.hits.hits.length) {
                const documents: ParliamentDocument[] = response.hits.hits.map((doc) => doc._source);
                await this.parseStakeholders(documents);
                if (response._scroll_id && this.executionTime < this.MAX_EXECUTION_TIME_S) {
                    return await this.continueScrollStakeholders(response._scroll_id);
                } else {
                    return { scrollId: response._scroll_id };
                }
            } else {
                return {};
            }
        } catch (error) {
            throw new Error(error);
        }
    }

}
