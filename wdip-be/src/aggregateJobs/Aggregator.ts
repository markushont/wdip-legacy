export default abstract class Aggregator {

    protected startTimeS: number;
    protected startTimeNs: number;
    protected readonly MAX_EXECUTION_TIME_S = 840;

    protected get executionTime(): number {
        if (!this.startTimeS) { [this.startTimeS, this.startTimeNs] = process.hrtime(); }
        return process.hrtime([this.startTimeS, this.startTimeNs])[0];
    }

    public async start() {
        [this.startTimeS, this.startTimeNs] = process.hrtime();
        return await this.startInternal();
    }

    protected abstract async startInternal();
}
