import moment from "moment";
import { BaseDocument } from "./BaseDocument";
import { DocumentStatus } from "./DocumentStatus";
import { DocumentType } from "./DocumentType";
import { Stakeholder, transformStakeholders } from "./Stakeholder";

export interface MotionDocument extends BaseDocument {
    title: string;
    subTitle: string;
    documentType: DocumentType.MOTION;
    stakeholders: Stakeholder[];
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
        stakeholders: transformStakeholders(source.dokintressent.intressent),
        published: moment(source.publicerad),
        documentStatus: DocumentStatus.APPROVED,
        meta: { created: moment(), updated: moment() }
    };
}
