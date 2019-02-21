import "jest-extended";
import { sync as loadJsonFile } from "load-json-file";
import moment from "moment";
import { ParliamentDocument } from "../ParliamentDocument";
import { Stakeholder } from "../Stakeholder";
import { StakeholderDocument, transformStakeholderDocument } from "../StakeholderDocument";

const sourceDocument1: any = loadJsonFile("src/models/__mocks__/motionDocument4.json");
const expectedDocument1: StakeholderDocument =
    loadJsonFile("src/models/__mocks__/expectedStakeholderDocument1.json");

// Seems hard to compare instances of moments. This workaround removes them and the test
// checks for the existance, which at least is something. TODO: Make better.
delete expectedDocument1.meta;

describe("StakeholderDocument tests", () => {
    test("Correctly transformed MotionDocument => StakeholderDocument", () => {
        const parliamentDoc: ParliamentDocument = sourceDocument1._source;
        const stakeholder: Stakeholder = parliamentDoc.stakeholders[0];
        expect(stakeholder).not.toBeNull();
        const stakeholderDoc = transformStakeholderDocument(parliamentDoc, stakeholder);
        expect(stakeholderDoc).toMatchObject(expectedDocument1);
    });

    test("Return empty SH if person isn't in ParliamentDocument", () => {
        const rogueSH: Stakeholder = {
            id: "0218878014918",
            name: "Stefan Löfven",
            party: {
                abbreviation: "S",
                id: "s",
                name: "Socialdemokraterna"
            },
            role: "Statsråd1"
        };
        const emptyStakeholder: StakeholderDocument = {
            id: rogueSH.id,
            stakeholder: rogueSH,
            published: [],
            meta: { created: moment(), updated: moment() }
        };
        delete emptyStakeholder.meta;

        const parliamentDoc: ParliamentDocument = sourceDocument1._source;
        const doc = transformStakeholderDocument(parliamentDoc, rogueSH);

        expect(doc).toMatchObject(emptyStakeholder);
    });
});
