import { Moment } from "moment";
import { DocumentMetaData } from "./DocumentMetaData";
import { DocumentStatus } from "./DocumentStatus";
import { DocumentType } from "./DocumentType";

export interface BaseDocument {
    id: string;
    originalId: string;
    documentType: DocumentType;
    published: Moment;
    documentStatus: DocumentStatus;
    meta: DocumentMetaData;
}
