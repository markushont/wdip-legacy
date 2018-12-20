import axios from "axios";
import { Moment } from "moment";
import { stringify } from "query-string";
import logger from "../logger";
import { ImportDocument, ImportDocumentType } from "./ImportDocument";
import { importQueue } from "./ImportQueue";

/**
 * Handles the job for importing documents from the parliament to the WDIP database by
 * running searches against the public API and publishing document events on the import
 * queue. The events on the queue are handled separately and allows us to scale the
 * import by having multiple workers picking up the events.
 *
 * TODO: When we add more sources other that the parliament, we could extract the common
 *       parts of this import class to an abstract base class.
 */
export abstract class ImportPublicationService {

    protected isRunning: boolean = false;
    protected isStopRequested: boolean = false;
    protected numberOfSuccesses: number = 0;
    protected numberOfErrors: number = 0;

    /**
     * Starts the import job.
     */
    public async start(...args: any[]) {
        // Nothing to do if the job is already running.
        if (this.isRunning) { return; }

        // Start the job with the default url.
        this.numberOfSuccesses = 0;
        this.numberOfErrors = 0;
        await this.search(this.getStartUrl(...args));
    }

    /**
     * Gets the status for the current or last run of the import job.
     */
    public status() {
        return {
            isRunning: this.isRunning,
            isStopRequested: this.isStopRequested,
            numberOfSuccesses: this.numberOfSuccesses,
            numberOfErrors: this.numberOfErrors
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

}
