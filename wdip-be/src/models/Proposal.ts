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

/**
 * Given a proposal, determines it's status. The chamberStatus and committeeStatus are interpreted so that
 * chamberStatus takes precidence.
 * @param proposal the proposal to determine status for
 */
export function determineProposalStatus(proposal: Proposal): ProposalStatus {
    // If chamberstatus is set, use that as the proposal status, otherwise use the committee status.
    if (proposal.chamberStatus && proposal.chamberStatus !== ProposalStatus.UNKNOWN) {
        return proposal.chamberStatus;
    } else if (proposal.committeeStatus) {
        return proposal.committeeStatus;
    }
    return ProposalStatus.UNKNOWN;
}
