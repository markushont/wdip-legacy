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
        id: source.dokument.dok_id || null,
        originalId: source.dokument.dok_id || null,
        title: source.dokument.titel || null,
        subTitle: source.dokument.subtitel || null,
        fullText: null,
        summary: source.dokument.summary || null,
        documentType: DocumentType.MOTION,
        documentSubtype: source.dokument.subtyp || null,
        stakeholders: transformStakeholders(source.dokintressent.intressent),
        proposals: transformProposals(source.dokforslag.forslag),
        published: moment.utc(source.dokument.publicerad),
        documentStatus: DocumentStatus.APPROVED,
        meta: { created: moment.utc(), updated: moment.utc() }
    };
}
