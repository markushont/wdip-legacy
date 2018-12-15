import "jest-extended";
import { other, partyFromAbbreviation, socialdemokraterna } from "../Party";

describe("Party tests", () => {

    test("Existing party, upper case", () => {
        expect(partyFromAbbreviation("S")).toBe(socialdemokraterna);
    });

    test("Existing party, lower case", () => {
        expect(partyFromAbbreviation("s")).toBe(socialdemokraterna);
    });

    test("Unknown party", () => {
        expect(partyFromAbbreviation("unknown")).toBe(other);
    });

    test("Null party", () => {
        expect(partyFromAbbreviation(null)).toBeNull();
    });

    test("Undefined party", () => {
        expect(partyFromAbbreviation(undefined)).toBeNull();
    });

});
