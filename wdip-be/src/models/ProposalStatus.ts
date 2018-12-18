export enum ProposalStatus {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    UNKNOWN = "UNKNOWN"
}

export function transformProposalStatus(source: any): ProposalStatus {
    if (source) {
        if (source.toLocaleLowerCase().includes("bifall")) {
            return ProposalStatus.APPROVED;
        }
        if (source.toLocaleLowerCase().includes("avslag")) {
            return ProposalStatus.REJECTED;
        }
    }
    return ProposalStatus.UNKNOWN;
}
