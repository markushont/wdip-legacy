import "jest-extended";
import { sync as loadJsonFile } from "load-json-file";
import { isMoment } from "moment";
import { DocumentStatus } from "../DocumentStatus";
import {
    determineDocumentStatus,
    ParliamentDocument,
    transformParliamentDocument
} from "../ParliamentDocument";
import { Proposal } from "../Proposal";
import { ProposalStatus } from "../ProposalStatus";

const sourceDocument1: any = loadJsonFile("src/models/__mocks__/motionDocument1.json");
const expectedDocument1: ParliamentDocument =
    loadJsonFile("src/models/__mocks__/expectedDocument1.json");

const sourceDocument2: any = loadJsonFile("src/models/__mocks__/motionDocument2.json");
const expectedDocument2: ParliamentDocument =
    loadJsonFile("src/models/__mocks__/expectedDocument2.json");

const sourceDocument3: any = loadJsonFile("src/models/__mocks__/motionDocument3.json");
const expectedDocument3: ParliamentDocument =
    loadJsonFile("src/models/__mocks__/expectedDocument3.json");

// Seems hard to compare instances of moments. This workaround removes them and the test
// checks for the existance, which at least is something. TODO: Make better.
delete expectedDocument1.meta;
delete expectedDocument1.published;
delete expectedDocument2.meta;
delete expectedDocument2.published;
delete expectedDocument3.meta;
delete expectedDocument3.published;

describe("MotionDocument tests", () => {

    test("Correctly transformed document", () => {
        const doc = transformParliamentDocument(sourceDocument1.dokumentstatus);
        expect(doc).toMatchObject(expectedDocument1);
        expect(isMoment(doc.published)).toBeTrue();
        expect(isMoment(doc.meta.created)).toBeTrue();
        expect(isMoment(doc.meta.updated)).toBeTrue();
    });

    test("Incomplete document", () => {
        const doc = transformParliamentDocument(sourceDocument2.dokumentstatus);
        expect(doc).toMatchObject(expectedDocument2);
        expect(isMoment(doc.published)).toBeTrue();
        expect(isMoment(doc.meta.created)).toBeTrue();
        expect(isMoment(doc.meta.updated)).toBeTrue();
    });

    test("Correctly transformed proposition", () => {
        const doc = transformParliamentDocument(sourceDocument3.dokumentstatus);
        expect(doc).toMatchObject(expectedDocument3);
        expect(isMoment(doc.published)).toBeTrue();
        expect(isMoment(doc.meta.created)).toBeTrue();
        expect(isMoment(doc.meta.updated)).toBeTrue();
    });

    test("Document source id is required", () => {
        const sourceDoc = { dokument: {} };
        expect(() => transformParliamentDocument(sourceDoc)).toThrowError();
    });

});

describe("Document status tests", () => {

    const propApproved1: Proposal = {
        committeeStatus: ProposalStatus.APPROVED,
        chamberStatus: ProposalStatus.APPROVED,
        wording: null
    };

    const propApproved2: Proposal = {
        committeeStatus: ProposalStatus.APPROVED,
        chamberStatus: ProposalStatus.UNKNOWN,
        wording: null
    };

    const propRejected1: Proposal = {
        committeeStatus: ProposalStatus.REJECTED,
        chamberStatus: ProposalStatus.REJECTED,
        wording: null
    };

    const propRejected2: Proposal = {
        committeeStatus: ProposalStatus.REJECTED,
        chamberStatus: ProposalStatus.UNKNOWN,
        wording: null
    };

    const propUnknown: Proposal = {
        committeeStatus: ProposalStatus.UNKNOWN,
        chamberStatus: ProposalStatus.UNKNOWN,
        wording: null
    };

    test.each(
        [
            [ProposalStatus.APPROVED, ProposalStatus.APPROVED, DocumentStatus.APPROVED],
            [ProposalStatus.APPROVED, ProposalStatus.REJECTED, DocumentStatus.REJECTED],
            [ProposalStatus.APPROVED, ProposalStatus.UNKNOWN, DocumentStatus.APPROVED],
            [ProposalStatus.REJECTED, ProposalStatus.APPROVED, DocumentStatus.APPROVED],
            [ProposalStatus.REJECTED, ProposalStatus.REJECTED, DocumentStatus.REJECTED],
            [ProposalStatus.REJECTED, ProposalStatus.UNKNOWN, DocumentStatus.REJECTED],
            [ProposalStatus.UNKNOWN, ProposalStatus.APPROVED, DocumentStatus.APPROVED],
            [ProposalStatus.UNKNOWN, ProposalStatus.REJECTED, DocumentStatus.REJECTED],
            [ProposalStatus.UNKNOWN, ProposalStatus.UNKNOWN, DocumentStatus.PENDING]
        ])
        ("Single proposal [committee %s, chamber %s]", (committeeStatus, chamberStatus, expectedDocumentStatus) => {
            expect(determineDocumentStatus([{ committeeStatus, chamberStatus, wording: null }])).
                toBe(expectedDocumentStatus);
        });

    test("Multiple propsosals, all approved", () => {
        const proposals: Proposal[] = [propApproved1, propApproved2];
        expect(determineDocumentStatus(proposals)).toBe(DocumentStatus.APPROVED);
    });

    test("Multiple propsosals, all rejected", () => {
        const proposals: Proposal[] = [propRejected1, propRejected2];
        expect(determineDocumentStatus(proposals)).toBe(DocumentStatus.REJECTED);
    });

    test("Multiple propsosals, both approved and rejected", () => {
        const proposals: Proposal[] = [propApproved1, propRejected1];
        expect(determineDocumentStatus(proposals)).toBe(DocumentStatus.APPROVED_PARTIALLY);
    });

    test("Multiple propsosals, pending", () => {
        const proposals: Proposal[] = [propApproved1, propRejected1, propUnknown];
        expect(determineDocumentStatus(proposals)).toBe(DocumentStatus.PENDING);
    });

    test("No propsosals", () => {
        const proposals: Proposal[] = [];
        expect(determineDocumentStatus(proposals)).toBe(DocumentStatus.PENDING);
    });

    test("Null propsosals", () => {
        expect(determineDocumentStatus(null)).toBe(DocumentStatus.PENDING);
    });

});
