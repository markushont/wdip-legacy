import "jest-extended";
import { transformDocumentReferences } from "../DocumentReference";

const sourceReference1 = {
    referenstyp: "behandlas_i",
    uppgift: "2016/17:NU25",
    ref_dok_id: "H401NU25",
    ref_dok_typ: "bet",
    ref_dok_rm: "2016/17",
    ref_dok_bet: "NU25",
    ref_dok_titel: "FooBar",
    ref_dok_subtitel: null,
    ref_dok_subtyp: "bet",
    ref_dok_dokumentnamn: "Betänkande"
};

const sourceReference2 = {
    referenstyp: "följdmotion",
    ref_dok_id: "H4023743",
    ref_dok_typ: "mot",
    ref_dok_rm: "2016/17",
    ref_dok_bet: "3743",
    ref_dok_titel: "FooBar",
    ref_dok_subtitel: "av Mattias Bäckström Johansson m.fl. (SD)",
    ref_dok_subtyp: "mot",
    ref_dok_dokumentnamn: "Motion"
};

const sourceReference3 = {
    referenstyp: "fooBar",
    ref_dok_id: "H4023743",
    ref_dok_typ: "mot",
    ref_dok_rm: "2016/17",
    ref_dok_bet: "3743",
    ref_dok_titel: "FooBar",
    ref_dok_subtitel: "av Mattias Bäckström Johansson m.fl. (SD)",
    ref_dok_subtyp: "mot",
    ref_dok_dokumentnamn: "Motion"
};

const sourceReferences = { referens: [sourceReference1, sourceReference2 ]};

const expectedReference1 = {
    type: "REPORT",
    id: "H401NU25"
};

const expectedReference2 = {
    type: "CONSEQUENT_MOTION",
    id: "H4023743"
};

const expectedReference3 = {
    type: "UNKNOWN",
    id: "H4023743"
};

describe("DocumentReference tests", () => {
    test("No references", () => {
        expect(transformDocumentReferences([])).
            toEqual([]);
        expect(transformDocumentReferences({ referens: [] })).
            toEqual([]);
    });

    test("Null references", () => {
        expect(transformDocumentReferences(null)).
            toEqual([]);
        expect(transformDocumentReferences({ referens: null })).
            toEqual([]);
    });

    test("Undefined references", () => {
        expect(transformDocumentReferences(undefined)).
            toEqual([]);
        expect(transformDocumentReferences({ referens: undefined })).
            toEqual([]);
    });

    test("Single proposal", () => {
        expect(transformDocumentReferences({referens: sourceReference1})).
            toEqual([expectedReference1]);
    });

    test("Single unknown proposal", () => {
        expect(transformDocumentReferences({referens: sourceReference3})).
            toEqual([expectedReference3]);
    });

    test("Multiple references", () => {
        expect(transformDocumentReferences(sourceReferences)).
            toEqual([expectedReference1, expectedReference2]);
    });
});
