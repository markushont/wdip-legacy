export enum ImportDocumentType {
    PARLIAMENT = "PARLIAMENT"
}

export class ImportDocument {

    public static deserialize(str: string): ImportDocument {
        const obj = JSON.parse(str);
        return Object.assign(new ImportDocument(), obj);
    }

    public id: string;
    public type: ImportDocumentType;

    constructor(id: string = null, type: ImportDocumentType = null) {
        this.id = id;
        this.type = type;
    }

    public serialize(): string {
        return JSON.stringify(this);
    }

}
