import moment from "moment";
import { BaseDocument } from "./BaseDocument";
import { DocumentStatus } from "./DocumentStatus";
import { DocumentType } from "./DocumentType";
import { Proposal, transformProposals } from "./Propsal";
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
    return {
        id: source.dok_id,
        originalId: source.dok_id,
        title: source.titel,
        subTitle: source.subtitel,
        fullText: null,
        summary: source.summary,
        documentType: DocumentType.MOTION,
        documentSubtype: source.subtyp,
        stakeholders: transformStakeholders(source.dokintressent.intressent),
        proposals: transformProposals(source.dokforslag.forslag),
        published: moment(source.publicerad),
        documentStatus: DocumentStatus.APPROVED,
        meta: { created: moment(), updated: moment() }
    };
}
