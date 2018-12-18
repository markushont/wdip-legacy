export interface Party {
    id: string;
    name: string;
    abbreviation: string;
}

export const socialdemokraterna: Party = { id: "s", name: "Socialdemokraterna", abbreviation: "S" };
export const moderaterna: Party = { id: "m", name: "Moderaterna", abbreviation: "M" };
export const liberalerna: Party = { id: "l", name: "Liberalerna", abbreviation: "L" };
export const folkpartiet: Party = { id: "fp", name: "Folkpartiet", abbreviation: "FP" };
export const kristdemokraterna: Party = { id: "kd", name: "Kristdemokraterna", abbreviation: "KD" };
export const vansterpartiet: Party = { id: "v", name: "Vänsterpartiet", abbreviation: "V" };
export const sverigedemokraterna: Party = { id: "sd", name: "Sverigedemokraterna", abbreviation: "SD" };
export const centerpartiet: Party = { id: "c", name: "Centerpartiet", abbreviation: "C" };
export const miljopartiet: Party = { id: "mp", name: "Miljöpartiet", abbreviation: "MP" };
export const other: Party = { id: "ö", name: "Övriga", abbreviation: "Ö" };

export const parties =
    [
        socialdemokraterna,
        moderaterna,
        folkpartiet,
        liberalerna,
        kristdemokraterna,
        vansterpartiet,
        sverigedemokraterna,
        centerpartiet,
        miljopartiet
    ];

export function partyFromAbbreviation(abbreviation: string) {
    if (!abbreviation) { return null; }
    return parties.find((p) => p.abbreviation === abbreviation.toUpperCase()) || other;
}
