import { ProposalStatus, transformProposalStatus } from "./ProposalStatus";

export interface Proposal {
    wording: string;
    committeeStatus: ProposalStatus;
    chamberStatus: ProposalStatus;
}

/**
 * Transforms one or many proposals to the WDIP data format. If the source
 * input is an array, each of the elemets are transformed, otherwise the
 * source itself is transformed.
 * @param source the source json object for propsals
 */
export function transformProposals(source: any): Proposal[] {
    if (!source) { return []; }

    if (Array.isArray(source)) {
        return source.map((proposal) => transformProposal(proposal));
    }

    return [transformProposal(source)];
}

function transformProposal(source: any) {
    return {
        wording: source.lydelse,
        committeeStatus: transformProposalStatus(source.utskottet),
        chamberStatus: transformProposalStatus(source.kammaren)
    };
}
