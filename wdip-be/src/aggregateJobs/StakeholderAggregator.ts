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
export default abstract class StakeholderAggregator extends Aggregator {

    protected readonly DATE_FORMAT: string = "YYYY-MM-DD";
    protected startTime: number;

    /**
     * Get stakeholder documents from DB
     * @param stakeholders array of stakeholders (e.g. from a ParliamentDocument)
     */
    protected async getExistingStakeholderDocs(stakeholders: Stakeholder[]): Promise<StakeholderDocumentSet> {
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
    protected async parseStakeholders(documents: ParliamentDocument[]) {
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
                    // Concatenate new document with existing
                    newStakeholderDoc.collaborations =
                        newStakeholderDoc.collaborations.concat(existingStakeholder.collaborations);
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
}
