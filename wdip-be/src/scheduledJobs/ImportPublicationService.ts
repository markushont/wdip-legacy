import moment from "moment";
import config from "../config/config";
import logger = require("../logger");

/**
 * Handles the job for importing documents from the parliament to the WDIP database by
 * running searches against the public API and publishing document events on the import
 * queue. The events on the queue are handled separately and allows us to scale the
 * import by having multiple workers picking up the events.
 */
export abstract class ImportPublicationService {

    protected isRunning: boolean = false;
    protected isStopRequested: boolean = false;
    protected numberOfSuccesses: number = 0;
    protected numberOfErrors: number = 0;

    private logIntervalId: NodeJS.Timeout;

    /**
     * Starts the import job.
     */
    public async start(...args: any[]) {
        // Nothing to do if the job is already running.
        if (this.isRunning) { return; }

        this.startStatusLogging();

        // Prepare the job start
        this.numberOfSuccesses = 0;
        this.numberOfErrors = 0;
        this.isRunning = true;
        this.isStopRequested = false;

        // Start the job
        await this.search(this.getStartUrl(...args));

        // Handle post run actions
        logger.info("Import publication job finished.", {
            numberOfSuccesses: this.numberOfSuccesses,
            numberOfErrors: this.numberOfErrors
        });
        this.isRunning = false;
        this.isStopRequested = false;

        this.stopStatusLogging();
    }

    /**
     * Gets the status for the current or last run of the import job.
     */
    public getStatus() {
        return {
            isRunning: this.isRunning,
            isStopRequested: this.isStopRequested,
            numberOfSuccesses: this.numberOfSuccesses,
            numberOfErrors: this.numberOfErrors,
            jobName: this.constructor.name,
            timestamp: moment.utc()
        };
    }

    /**
     * Stops the import job gracefully.
     */
    public stop() {
        if (this.isRunning) {
            this.isStopRequested = true;
        }
    }

    /**
     * Logs the current status of the import job to the database for monitoring.
     */
    protected abstract logStatus();

    protected abstract search(url: string);

    /**
     * Returns a start search url, given the input dates.
     * @param from the date to search from
     * @param to the date to search to
     */
    protected abstract getStartUrl(...args: any[]);

    /**
     * Processes the given documents by adding them to the import queue.
     * @param documents list of documents to be processed
     */
    protected abstract processDocuments(documents: any[]);

    private startStatusLogging() {
        // Schedule status logging
        if (config.STATUS_INTERVAL_IPS_MS > 0) {
            // Log a first time before we start the timer
            this.logStatus();
            this.logIntervalId = setInterval(this.logStatus.bind(this), config.STATUS_INTERVAL_IPS_MS);
        }
    }

    private stopStatusLogging() {
        if (this.logIntervalId) {
            // Log a final time before we stop
            this.logStatus();
            clearInterval(this.logIntervalId);
            this.logIntervalId = null;
        }
    }

}
