export enum DocumentReferenceType {
    CONSEQUENT_MOTION = "CONSEQUENT_MOTION", // Följdmotion
    REPORT = "REPORT", // Betänkande
    UNKNOWN = "UNKNOWN"
}

export interface DocumentReference {
    type: DocumentReferenceType;
    id: string;
}

export function transformDocumentReferences(source: any): DocumentReference[] {
    if (!source || !source.referens) { return []; }

    if (Array.isArray(source.referens)) {
        return source.referens
        .map((referens) => transformDocumentReference(referens))
        .filter((referens) => { return referens != null; });
    }

    return [transformDocumentReference(source.referens)];
}

function transformDocumentReference(referens: any): DocumentReference {
    if (referens && referens.referenstyp && referens.ref_dok_id) {
        let type = DocumentReferenceType.UNKNOWN;
        switch (referens.referenstyp) {
            case "följdmotion":
                type = DocumentReferenceType.CONSEQUENT_MOTION;
                break;
            case "behandlas_i":
                type = DocumentReferenceType.REPORT;
                break;
        }
        return {
            type,
            id: referens.ref_dok_id
        };
    }
    return null;
}