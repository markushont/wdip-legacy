import "jest-extended";
import { moderaterna, sverigedemokraterna } from "../Party";
import { Stakeholder, transformStakeholders } from "../Stakeholder";

const sourceStakeholder1 = {
    roll: "undertecknare",
    namn: "David Lång",
    partibet: "SD",
    intressent_id: "0494054455310"
};

const sourceStakeholder2 = {
    roll: "undertecknare",
    namn: "Camilla Waltersson Grönvall",
    partibet: "M",
    intressent_id: "0781623040415"
};

const sourceStakeholders = [sourceStakeholder1, sourceStakeholder2];

const expectedStakeholder1: Stakeholder = {
    id: "0494054455310",
    name: "David Lång",
    party: sverigedemokraterna,
    role: "undertecknare"
};

const expectedStakeholder2: Stakeholder = {
    id: "0781623040415",
    name: "Camilla Waltersson Grönvall",
    party: moderaterna,
    role: "undertecknare"
};

describe("Stakeholder tests", () => {

    test("No stakeholders", () => {
        expect(transformStakeholders([])).
            toEqual([]);
    });

    test("Null stakeholders", () => {
        expect(transformStakeholders(null)).
            toEqual([]);
    });

    test("Undefined stakeholders", () => {
        expect(transformStakeholders(undefined)).
            toEqual([]);
    });

    test("List of stakeholders", () => {
        expect(transformStakeholders(sourceStakeholders)).
            toEqual([expectedStakeholder1, expectedStakeholder2]);
    });

});
