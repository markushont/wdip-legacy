import "jest-extended";
import { ProposalStatus, transformProposalStatus } from "../ProposalStatus";

describe("ProposalStatus tests", () => {

    test.each([
        ["bifall", ProposalStatus.APPROVED],
        ["avslag", ProposalStatus.REJECTED],
        ["unknown", ProposalStatus.UNKNOWN],
        [null, ProposalStatus.UNKNOWN],
        [undefined, ProposalStatus.UNKNOWN]
    ])("Test source status string '%s'", (sourceString, expectedStatus) => {
        expect(transformProposalStatus(sourceString))
            .toBe(expectedStatus);
    });
});
