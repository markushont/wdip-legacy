import { SearchParams, SearchResponse } from "elasticsearch";
import { Moment } from "moment";
import config from "../config/config";
import dbClient from "../dbclient";
import logger from "../logger";
import { DocumentReferenceType } from "../models/DocumentReference";
import { ParliamentDocument } from "../models/ParliamentDocument";
import { Stakeholder } from "../models/Stakeholder";
import {
    StakeholderDocument,
    StakeholderDocumentSet,
    transformStakeholderDocument
} from "../models/StakeholderDocument";
import { hasCollaboration } from "../models/StakeholderDocumentCollection";
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

    private readonly DATE_FORMAT: string = "YYYY-MM-DD";

    /**
     * @param fromDate beginning of date range (for the 'published' field)
     * @param toDate end of date range (for the 'published' field)
     * @param scrollId pagination cursor for previous search
     */
    constructor(fromDate: Moment, toDate: Moment, scrollId?: string) {
        super();
        this.fromDate = fromDate.format(this.DATE_FORMAT);
        this.toDate = toDate.format(this.DATE_FORMAT);
        this.scrollId = scrollId || null;
    }

    public setFromDate(fromDate: Moment) { this.fromDate = fromDate.format(this.DATE_FORMAT); }
    public setToDate(toDate: Moment) { this.toDate = toDate.format(this.DATE_FORMAT); }
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
            // TODO: split this into two classes that inherits from Aggregator
            if (!this.scrollId) {
                return await this.scrollStakeholders(this.fromDate, this.toDate);
            } else {
                return await this.continueScrollStakeholders(this.scrollId);
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get stakeholder documents from DB
     * @param stakeholders array of stakeholders (e.g. from a ParliamentDocument)
     */
    private async getExistingStakeholderDocs(stakeholders: Stakeholder[]): Promise<StakeholderDocumentSet> {
        const existingStakeholders = {};
        try {
            const ids = stakeholders.map((stakeholder) => stakeholder.id);
            const response = await dbClient.mget<StakeholderDocument>({
                index: config.WDIP_STAKEHOLDERS_INDEX,
                type: "STAKEHOLDER",
                body: { ids }
            });
            for (const doc of response.docs) {
                existingStakeholders[doc._id] = doc._source;
            }
            return existingStakeholders;
        } catch (error) {
            logger.error(error);
        }
    }

    /**
     * Goes through stakeholders in set, lookup existing data in DB and add new
     * stakeholder relations
     * @param documents array of ParliamentDocuments to parse
     */
    private async parseStakeholders(documents: ParliamentDocument[]) {
        if (!documents || !documents.length) { return; }

        logger.debug(`Parsing ${documents.length} ParliamentDocuments`);

        // Go through documents and parse stakeholders
        for (const parliamentDocument of documents) {
            const stakeholders = parliamentDocument.stakeholders;
            if (!stakeholders || !stakeholders.length) { continue; }

            const existingStakeholders = await this.getExistingStakeholderDocs(stakeholders);

            // For each stakeholder, add the other stakeholders as collaborators
            const bulkDocs = [];
            for (const stakeholder of stakeholders) {
                // Index operation info (instruction for ElasticSearch)
                const indexObj = {
                    update: {
                        _index: config.WDIP_STAKEHOLDERS_INDEX,
                        _type: "STAKEHOLDER",
                        _id: stakeholder.id
                    }
                };

                // Build StakeholderDocument from Stakeholder in ParliamentDocument
                const newStakeholderDoc = transformStakeholderDocument(parliamentDocument, stakeholder);

                // Append existing data from DB to newStakeholderDoc
                const existingStakeholder = existingStakeholders[stakeholder.id];
                if (existingStakeholder) {
                    newStakeholderDoc.meta.created = existingStakeholder.meta.created;
                    newStakeholderDoc.published = newStakeholderDoc.published.concat(existingStakeholder.published);

                    for (const collaborator of existingStakeholder.collaborations) {
                        // If stakeholders already collaborated, update, else create new
                        if (hasCollaboration(newStakeholderDoc.collaborations, collaborator)) {
                            // If collaboration already exists, check if they collaborated in _this_ ParliamentDocument
                            let hasCollaborated = false;
                            for (const reference of collaborator.references) {
                                hasCollaborated = reference.id === parliamentDocument.id;
                            }
                            if (!hasCollaborated) {
                                collaborator.references.push({
                                    id: parliamentDocument.id,
                                    type: DocumentReferenceType.BASE_DOCUMENT
                                });
                            }
                        } else {
                            collaborator.references = [{
                                id: parliamentDocument.id,
                                type: DocumentReferenceType.BASE_DOCUMENT
                            }];
                        }
                    }
                }

                // Build index body
                // doc_as_upsert: create document if it doesn't exist, otherwise update
                const bodyObj = {
                    doc: newStakeholderDoc,
                    doc_as_upsert: true
                };

                // Push Index operation and Body ready to push to DB
                bulkDocs.push(indexObj);
                bulkDocs.push(bodyObj);
            }

            if (bulkDocs.length) {
                try {
                    logger.debug(`Pushing ${bulkDocs.length / 2} documents`);
                    await dbClient.bulk({ body: bulkDocs });
                } catch (error) {
                    throw error;
                }
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
