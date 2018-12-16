import { Party, partyFromAbbreviation } from "./Party";

export interface Stakeholder {
    id: string;
    name: string;
    party: Party;
    role: string;
}

/**
 * Transforms one or many stakeholders to the WDIP data format. If the source
 * input is an array, each of the elemets are transformed, otherwise the
 * source itself is transformed.
 * @param source the source json object for stakeholders
 */
export function transformStakeholders(source: any): Stakeholder[] {
    if (!source) { return []; }

    if (Array.isArray(source)) {
        return source.map((stakeholder) => transformStakeholder(stakeholder));
    }

    return [transformStakeholder(source)];
}

function transformStakeholder(source: any): Stakeholder {
    return {
        id: source.intressent_id,
        name: source.namn,
        party: partyFromAbbreviation(source.partibet),
        role: source.roll
    };
}
