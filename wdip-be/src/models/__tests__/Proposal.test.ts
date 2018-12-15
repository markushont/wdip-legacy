import "jest-extended";
import { ProposalStatus } from "../ProposalStatus";
import { Proposal, transformProposals } from "../Propsal";

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

    test("Single proposal", () => {
        expect(transformProposals(sourceProposal1)).
            toEqual([expectedProposal1]);
    });

    test("Multiple proposals", () => {
        expect(transformProposals(sourceProposals)).
            toEqual([expectedProposal1, expectedProposal2]);
    });

});
