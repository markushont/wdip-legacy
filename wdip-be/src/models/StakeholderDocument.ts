import moment = require("moment");
import { DocumentMetaData } from "./DocumentMetaData";
import { DocumentReference, DocumentReferenceType } from "./DocumentReference";
import { ParliamentDocument } from "./ParliamentDocument";
import { Stakeholder } from "./Stakeholder";
import { StakeholderDocumentCollection } from "./StakeholderDocumentCollection";

export interface StakeholderDocumentSet {
    [key: string]: StakeholderDocument;
}

/**
 * @param id stakeholder id
 * @param stakeholder stakeholder data
 * @param collaborations people that this stakeholder collaborates with
 */
export interface StakeholderDocument {
    id: string;
    stakeholder: Stakeholder;
    collaborations?: StakeholderDocumentCollection[];
    published: DocumentReference[];
    meta: DocumentMetaData;
}

/**
 * Takes a Stakeholder and creates a StakeholderDocument
 * @param sourceSH source stakeholder to build from
 * @param sourcePD ParliamentDocument to extract other stakeholders from
 */
export function transformStakeholderDocument(
    sourcePD: ParliamentDocument,
    sourceSH: Stakeholder
): StakeholderDocument {

    if (!sourceSH || !sourcePD) { throw new Error("Missing parameters"); }

    const collaborations: StakeholderDocumentCollection[] = [];
    const pdStakeholders = sourcePD.stakeholders;

    // Early out if sourceSH hasn't contributed to sourcePD
    if (!pdStakeholders.filter((sh) => sh.id === sourceSH.id).length) {
        return {
            id: sourceSH.id,
            stakeholder: sourceSH,
            published: [],
            meta: { created: moment(), updated: moment() }
        };
    }

    // Add collaborations, avoid duplicates
    const otherStakeholders = pdStakeholders.filter((sh) => sh.id !== sourceSH.id);
    for (const otherSH of otherStakeholders) {
        const shDocumentCollection: StakeholderDocumentCollection = {
            ...otherSH,
            references: [{
                type: DocumentReferenceType.BASE_DOCUMENT,
                id: sourcePD.id
            }]
        };
        collaborations.push(shDocumentCollection);
    }

    return {
        id: sourceSH.id,
        stakeholder: sourceSH,
        collaborations,
        published: [{
            id: sourcePD.id,
            type: DocumentReferenceType.BASE_DOCUMENT
        }],
        meta: { created: moment(), updated: moment() }
    };
}
