import { Normalizer } from "./Normalizer";

describe('Normalizer, default range', () => {

    let n: Normalizer;
    beforeAll(() => {
        n = new Normalizer(1, 10);
    });

    test.each(
        [
            [1, 1],
            [2, 12],
            [3, 23],
            [4, 34],
            [5, 45],
            [6, 56],
            [7, 67],
            [8, 78],
            [9, 89],
            [10, 100],
        ]
    )('test normalize %s', (val, exp) => {
        expect(n.normalize(val)).toBe(exp);
    });

});

describe('Normalizer, custom range', () => {

    let n: Normalizer;
    beforeAll(() => {
        n = new Normalizer(1, 10, 10, 20);
    });

    test.each(
        [
            [1, 10],
            [2, 11],
            [3, 12],
            [4, 13],
            [5, 14],
            [6, 16],
            [7, 17],
            [8, 18],
            [9, 19],
            [10, 20],
        ]
    )('test normalize %s', (val, exp) => {
        expect(n.normalize(val)).toBe(exp);
    });

})

