export enum ImportDocumentType {
    PARLIAMENT = "PARLIAMENT"
}

export class ImportDocument {

    public id: string;
    public type: ImportDocumentType;

    constructor(id: string, type: ImportDocumentType) {
        this.id = id;
        this.type = type;
    }

    public serialize(): string {
        return JSON.stringify(this);
    }

}
