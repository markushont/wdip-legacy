import { DocumentReference } from "./DocumentReference";
import { Stakeholder } from "./Stakeholder";

export interface StakeholderDocumentCollectionSet {
    [stakeholderId: string]: StakeholderDocumentCollection;
}

export interface StakeholderDocumentCollection extends Stakeholder {
    references: DocumentReference[];
}

/**
 * Check if StakeholderDocumentCollection[] contains value
 * @param source collection to check in
 * @param target target value to check for
 */
export function hasCollaboration(
    source: StakeholderDocumentCollection[],
    target: StakeholderDocumentCollection
): StakeholderDocumentCollection {
    for (const sdc of source) {
        if (sdc.id === target.id) { return sdc; }
    }
    return null;
}
