import { Party, partyFromAbbreviation } from "./Party";

export interface Stakeholder {
    id: string;
    name: string;
    party: Party;
    role: string;
}

function transformStakeholder(source: any): Stakeholder {
    return {
        id: source.intressent_id,
        name: source.namn,
        party: partyFromAbbreviation(source.partibet),
        role: source.roll
    };
}

export function transformStakeholders(source: any[]): Stakeholder[] {
    if (!source) { return []; }

    return source.map((s) => transformStakeholder(s));
}
