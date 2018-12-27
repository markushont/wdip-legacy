import "jest-extended";
import { determineProposalStatus, Proposal, transformProposals } from "../Proposal";
import { ProposalStatus } from "../ProposalStatus";

const sourceProposal1 = {
    nummer: "1",
    beteckning: null,
    lydelse: "Riksdagen avslår propositionen.",
    lydelse2: null,
    utskottet: "Avslag",
    kammaren: "Avslag",
    behandlas_i: "2017/18:FöU13",
    behandlas_i_punkt: null,
    kammarbeslutstyp: null,
    intressent: "FöU",
    avsnitt: null,
    grundforfattning: null,
    andringsforfattning: null
};

const sourceProposal2 = {
    nummer: "2",
    beteckning: null,
    lydelse: "Riksdagen ställer sig bakom det som anförs i motionen.",
    lydelse2: null,
    utskottet: "Avslag",
    kammaren: "Avslag",
    behandlas_i: "2017/18:FöU13",
    behandlas_i_punkt: null,
    kammarbeslutstyp: null,
    intressent: "FöU",
    avsnitt: null,
    grundforfattning: null,
    andringsforfattning: null
};

const sourceProposals = [sourceProposal1, sourceProposal2];

const expectedProposal1: Proposal = {
    wording: "Riksdagen avslår propositionen.",
    chamberStatus: ProposalStatus.REJECTED,
    committeeStatus: ProposalStatus.REJECTED
};

const expectedProposal2: Proposal = {
    wording: "Riksdagen ställer sig bakom det som anförs i motionen.",
    chamberStatus: ProposalStatus.REJECTED,
    committeeStatus: ProposalStatus.REJECTED
};

describe("Propsal tests", () => {

    test("No proposals", () => {
        expect(transformProposals([])).
            toEqual([]);
    });

    test("Null proposals", () => {
        expect(transformProposals(null)).
            toEqual([]);
    });

    test("Undefined proposals", () => {
        expect(transformProposals(undefined)).
            toEqual([]);
    });

    test("Single proposal", () => {
        expect(transformProposals(sourceProposal1)).
            toEqual([expectedProposal1]);
    });

    test("Multiple proposals", () => {
        expect(transformProposals(sourceProposals)).
            toEqual([expectedProposal1, expectedProposal2]);
    });

});

describe("Determine proposal status", () => {

    test.each([
        [ProposalStatus.APPROVED, ProposalStatus.APPROVED, ProposalStatus.APPROVED],
        [ProposalStatus.APPROVED, ProposalStatus.REJECTED, ProposalStatus.REJECTED],
        [ProposalStatus.APPROVED, ProposalStatus.UNKNOWN, ProposalStatus.APPROVED],
        [ProposalStatus.REJECTED, ProposalStatus.APPROVED, ProposalStatus.APPROVED],
        [ProposalStatus.REJECTED, ProposalStatus.REJECTED, ProposalStatus.REJECTED],
        [ProposalStatus.REJECTED, ProposalStatus.UNKNOWN, ProposalStatus.REJECTED],
        [ProposalStatus.UNKNOWN, ProposalStatus.APPROVED, ProposalStatus.APPROVED],
        [ProposalStatus.UNKNOWN, ProposalStatus.REJECTED, ProposalStatus.REJECTED],
        [null, ProposalStatus.APPROVED, ProposalStatus.APPROVED],
        [ProposalStatus.APPROVED, null, ProposalStatus.APPROVED],
        [null, null, ProposalStatus.UNKNOWN]
    ])("Proposal status [committee %s, chamber %s]", (committeeStatus, chamberStatus, expectedProposalStatus) => {
        expect(determineProposalStatus({ committeeStatus, chamberStatus, wording: null })).toBe(expectedProposalStatus);
    });

});
