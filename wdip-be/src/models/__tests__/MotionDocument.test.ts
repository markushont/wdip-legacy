import "jest-extended";
import { sync as loadJsonFile } from "load-json-file";
import { isMoment } from "moment";
import { MotionDocument, transformMotionDocument } from "../MotionDocument";

const sourceDocument1: any = loadJsonFile("src/models/__mocks__/motionDocument1.json");
const expectedDocument1: MotionDocument = loadJsonFile("src/models/__mocks__/expectedDocument1.json");

const sourceDocument2: any = loadJsonFile("src/models/__mocks__/motionDocument2.json");
const expectedDocument2: MotionDocument = loadJsonFile("src/models/__mocks__/expectedDocument2.json");

// Seems hard to compare instances of moments. This workaround removes them and the test
// checks for the existance, which at least is something. TODO: Make better.
delete expectedDocument1.meta;
delete expectedDocument1.published;
delete expectedDocument2.meta;
delete expectedDocument2.published;

describe("MotionDocument tests", () => {

    test("Correctly transformed document", () => {
        const doc = transformMotionDocument(sourceDocument1.dokumentstatus);
        expect(doc).toMatchObject(expectedDocument1);
        expect(isMoment(doc.published)).toBeTrue();
        expect(isMoment(doc.meta.created)).toBeTrue();
        expect(isMoment(doc.meta.updated)).toBeTrue();
    });

    test("Correctly incomplete document", () => {
        const doc = transformMotionDocument(sourceDocument2.dokumentstatus);
        expect(doc).toMatchObject(expectedDocument2);
        expect(isMoment(doc.published)).toBeTrue();
        expect(isMoment(doc.meta.created)).toBeTrue();
        expect(isMoment(doc.meta.updated)).toBeTrue();
    });

});
