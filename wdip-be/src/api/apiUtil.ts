export function transformMotion(dbHit: any)  {
    const {
        id,
        title,
        documentStatus,
        documentType,
        proposals,
        stakeholders
    } = dbHit._source;

    const parsedStakeholders = stakeholders.map((stakeholder) => {
        return {
            id: stakeholder.id,
            name: stakeholder.name,
            party: stakeholder.party.id
        };
    });

    return {
        id,
        title,
        documentStatus,
        documentType,
        proposals,
        stakeholders: parsedStakeholders
    };
}
