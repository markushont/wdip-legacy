export enum DocumentType {
    MOTION = "MOTION",
    PROPOSITION = "PROPOSITION"
}

export function transformDocumentType(source: any): DocumentType {
    switch (source.dokument.doktyp) {
        case "mot": return DocumentType.MOTION;
        case "prop": return DocumentType.PROPOSITION;
        default: return DocumentType.MOTION;
    }
}