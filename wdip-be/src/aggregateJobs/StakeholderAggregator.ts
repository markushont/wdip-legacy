import { SearchParams, SearchResponse } from "elasticsearch";
import moment = require("moment");
import config from "../config/config";
import dbClient from "../dbclient";
import logger = require("../logger");
import { ParliamentDocument } from "../models/ParliamentDocument";
import Aggregator from "./Aggregator";

/**
 * Goes through ParliamentDocuments and aggregates stakeholders based on which
 * stakeholders have published documents together. Takes either a date range
 * (fromDate, toDate) or a scrollId which is a pagination cursor for a larger
 * set of results.
 */
export default class StakeholderAggregator extends Aggregator {

    private fromDate: string;
    private toDate: string;
    private scrollId: string;

    /**
     * @param fromDate beginning of date range (for the 'published' field)
     * @param toDate end of date range (for the 'published' field)
     * @param scrollId pagination cursor for previous search
     */
    constructor(fromDate: string, toDate: string, scrollId?: string) {
        super();
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.scrollId = scrollId || null;
    }

    public setFromDate(fromDate: string) { this.fromDate = fromDate; }
    public setToDate(toDate: string) { this.toDate = toDate; }
    public setScrollId(scrollId: string) { this.scrollId = scrollId; }

    public async start() {
        // Use either date range or scrollId
        if (!this.fromDate || !this.toDate) {
            if (!this.scrollId) {
                logger.error(`AggregateStakeholders: Missing parameters, got
                    fromDate: ${this.fromDate}
                    toDate: ${this.toDate}
                    scrollId: ${this.scrollId}
                    Requires either (fromDate, toDate) or scrollId.
                `);
                return;
            }
        }

        try {
            if (!this.scrollId) {
                const scrollId = await this.scrollStakeholders(this.fromDate, this.toDate);
                return scrollId;
            } else {
                const scrollId = await this.continueScrollStakeholders(this.scrollId);
                return scrollId;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Goes through stakeholders in set, lookup existing data in DB and add new
     * stakeholder relations
     * @param documents array of ParliamentDocuments to parse
     */
    private async parseStakeholders(documents: ParliamentDocument[]) {
        if (!documents || !documents.length) { return; }

        // Go through documents and parse stakeholders
        for (const parliamentDocument of documents) {
            const stakeholders = parliamentDocument.stakeholders;
            if (!stakeholders.length || stakeholders.length < 2) { continue; }

            // Get existing stakeholder docs
            const existingStakeholders = {};
            try {
                const ids = stakeholders.map((stakeholder) => stakeholder.id);
                const response = await dbClient.mget({
                    index: config.WDIP_STAKEHOLDERS_INDEX,
                    type: "STAKEHOLDER",
                    body: { ids }
                });
                for (const doc of response.docs) {
                    existingStakeholders[doc._id] = doc._source;
                }
            } catch (error) {
                logger.error(error);
            }

            // Update array of related stakeholders for each stakeholder
            const bulkDocs = [];
            for (const stakeholder of stakeholders) {
                // Index operation info
                const indexObj = {
                    update: {
                        _index: config.WDIP_STAKEHOLDERS_INDEX,
                        _type: "STAKEHOLDER",
                        _id: stakeholder.id
                    }
                };
                // Body
                const existingStakeholderIds = existingStakeholders[stakeholder.id] ?
                    existingStakeholders[stakeholder.id].relatedStakeholders :
                    [];
                const newRelatedStakeholderIds = stakeholders
                    .filter((item) => item.id !== stakeholder.id)
                    .map((doc) => doc.id);
                const uniqueRelatedStakeholderIds =
                    [...new Set(existingStakeholderIds.concat(newRelatedStakeholderIds))];

                // doc_as_upsert: create document if it doesn't exist, otherwise update
                const bodyObj = {
                    doc: {
                        stakeholder,
                        relatedStakeholders: uniqueRelatedStakeholderIds,
                        meta: {
                            updated: moment().utc()
                        }
                    },
                    doc_as_upsert: true
                };
                bulkDocs.push(indexObj);
                bulkDocs.push(bodyObj);
            }
            try {
                logger.debug(`Pushing ${bulkDocs.length ? bulkDocs.length / 2 : 0} documents`);
                await dbClient.bulk({ body: bulkDocs });
            } catch (error) {
                throw error;
            }
        }
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
                _source: ["stakeholders"],
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
            const documents = response.hits.hits.map((doc) => doc._source);
            await this.parseStakeholders(documents);
            logger.debug(`Found ${response.hits.hits.length} documents.`);
            // TODO: Break when execution timeout is reached
            if (response._scroll_id && response.hits.hits.length) {
                return await this.continueScrollStakeholders(response._scroll_id);
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    private async continueScrollStakeholders(scrollId: string) {
        try {
            const response: SearchResponse<ParliamentDocument> = await dbClient.scroll<ParliamentDocument>({
                scrollId,
                scroll: "20h"
            });
            const documents: ParliamentDocument[] = response.hits.hits.map((doc) => doc._source);
            await this.parseStakeholders(documents);
            // TODO: Break when execution timeout is reached
            if (response._scroll_id && response.hits.hits.length) {
                return await this.continueScrollStakeholders(response._scroll_id);
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }
}
