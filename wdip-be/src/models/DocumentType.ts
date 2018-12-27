export enum DocumentType {
    MOTION = "MOTION",
    PROPOSITION = "PROPOSITION"
}

export function transformDocumentType(source: any): DocumentType {
    switch (source) {
        case "mot": return DocumentType.MOTION;
        case "prop": return DocumentType.PROPOSITION;
        default: return DocumentType.MOTION;
    }
}

export function getDocumentTypeString(source: DocumentType): string {
    switch (source) {
        case DocumentType.MOTION: return "mot";
        case DocumentType.PROPOSITION: return "prop";
        default: return "";
    }
}
