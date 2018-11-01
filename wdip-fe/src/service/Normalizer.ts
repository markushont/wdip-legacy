export class Normalizer {
    /**
     * 
     * @param min The minimum value of the data set
     * @param max The maximum value of the data set
     * @param normMin The minimum value of the normalized range, default 1
     * @param normMax The maximum value of the normalized range, default 100
     */
    constructor(min: number, max: number, normMin: number = 1, normMax: number = 100) {
        this.min = min;
        this.max = max;
        this.normMin = normMin;
        this.normMax = normMax;
    }

    private min: number;
    private max: number;
    private normMin: number;
    private normMax: number;

    /**
     * Normalizes the number to a result between 1 and 100.
     * @param val The number to normalize
     */
    public normalize(val: number) {
        if (val < this.min) throw new Error(`Cannot normalize ${val}. Needs to be between ${this.min} and ${this.max}.`);
        if (val > this.max) throw new Error(`Cannot normalize ${val}. Needs to be between ${this.min} and ${this.max}.`);

        return Math.round((val - this.min) / (this.max - this.min) * (this.normMax - this.normMin) + this.normMin);
    }
}