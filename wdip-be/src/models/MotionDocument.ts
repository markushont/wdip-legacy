import moment from "moment";
import { BaseDocument } from "./BaseDocument";
import { DocumentStatus } from "./DocumentStatus";
import { DocumentType } from "./DocumentType";
import { ProposalStatus } from "./ProposalStatus";
import { determineProposalStatus, Proposal, transformProposals } from "./Propsal";
import { Stakeholder, transformStakeholders } from "./Stakeholder";

export interface MotionDocument extends BaseDocument {
    title: string;
    subTitle: string;
    documentType: DocumentType.MOTION;
    documentSubtype: string;
    stakeholders: Stakeholder[];
    proposals: Proposal[];
    summary: string;
    fullText: string;
}

export function transformMotionDocument(source: any): MotionDocument {
    const proposals = transformProposals(source.dokforslag.forslag);
    return {
        id: source.dokument.dok_id || null,
        originalId: source.dokument.dok_id || null,
        title: source.dokument.titel || null,
        subTitle: source.dokument.subtitel || null,
        fullText: null,
        summary: source.dokument.summary || null,
        documentType: DocumentType.MOTION,
        documentSubtype: source.dokument.subtyp || null,
        stakeholders: transformStakeholders(source.dokintressent.intressent),
        proposals,
        published: moment.utc(source.dokument.publicerad),
        documentStatus: determineDocumentStatus(proposals),
        meta: { created: moment.utc(), updated: moment.utc() }
    };
}

/**
 * A document is considered
 *   approved all proposals are approved,
 *   rejected if all proposals are rejected
 *   partially approved if at least one, but not all, proposal is approved
 *   pending if any proposal lacks status
 * @param proposals the list of proposals
 */
export function determineDocumentStatus(proposals: Proposal[]): DocumentStatus {
    // Count the different statuses for the proposals.
    const statuses = proposals.
        map(
            (proposal) => determineProposalStatus(proposal)).
        reduce(
            (agg, curr) => {
                agg[curr] += 1;
                return agg;
            },
            { [ProposalStatus.APPROVED]: 0, [ProposalStatus.REJECTED]: 0, [ProposalStatus.UNKNOWN]: 0 });

    const approved = statuses[ProposalStatus.APPROVED];
    const rejected = statuses[ProposalStatus.REJECTED];
    const unknown = statuses[ProposalStatus.UNKNOWN];
    const total = proposals.length;

    if (rejected === total) { return DocumentStatus.REJECTED; }
    if (approved === total) { return DocumentStatus.APPROVED; }
    if (unknown === 0) { return DocumentStatus.APPROVED_PARTIALLY; }
    return DocumentStatus.PENDING;
}
