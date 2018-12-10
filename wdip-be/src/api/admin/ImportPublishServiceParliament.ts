import axios from "axios";
import moment, { Moment } from "moment";
import { stringify } from "query-string";
import logger from "../../logger";
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
class ImportPublishServiceParliament {

    private isRunning: boolean = false;
    private isStopRequested: boolean = false;
    private numberOfSuccesses: number = 0;
    private numberOfErrors: number = 0;

    /**
     * Starts the import job.
     */
    public async start(from: Moment, to: Moment) {
        // Nothing to do if the job is already running.
        if (this.isRunning) { return; }

        // Start the job with the default url.
        this.numberOfSuccesses = 0;
        this.numberOfErrors = 0;
        await this.search(this.getStartUrl(from, to));
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

    /**
     * Fetches data from the given search url and adds the result to the processing queue. The search
     * recursively calls itself as long as the url to the next search result page is present. When the
     * {isStopRequested} attribute is set, the recursion will stop as well.
     * @param url the search url to fetch
     */
    private async search(url: string = null) {
        // Halt the execution if stop is requested.
        if (this.isStopRequested) {
            this.isRunning = false;
            this.isStopRequested = false;
            return;
        }

        // End import if the url is not set.
        if (!url) {
            logger.info("Import job finished.", { numberOfDocuments: this.numberOfSuccesses });
            this.isRunning = false;
            this.isStopRequested = false;
            return;
        }

        // Fetch the search url and process the result
        this.isRunning = true;
        try {
            logger.debug("Fetching data.", { url });
            const response = await axios.get(url);

            logger.debug("Processing recieved documents.");
            this.processDocuments(response.data.dokumentlista.dokument);

            // Recursively fetch the next page of documents. Note that the last page does not
            // contain the '@nasta_sida' property, causing the recursion to stop.
            // TODO: Can be the same as the current search if the search is more than 500 pages.
            await this.search(response.data.dokumentlista["@nasta_sida"]);
        } catch (error) {
            logger.error("There was an error fetching documents. Aborting import job.", error);
            this.isRunning = false;
            this.isStopRequested = false;
        }
    }

    /**
     * Returns a start search url, given the input dates.
     * @param from the date to search from
     * @param to the date to search to
     */
    private getStartUrl(from: Moment, to: Moment): string {
        const queryParams = {
            doktyp: "mot",
            from: from.format("YYYY-MM-DD"),
            tom: to.format("YYYY-MM-DD"),
            sort: "datum",
            sortorder: "asc",
            utformat: "json"
        };

        return `http://data.riksdagen.se/dokumentlista/?${stringify(queryParams)}`;
    }

    /**
     * Processes the given documents by adding them to the import queue.
     * @param documents list of documents to be processed
     */
    private processDocuments(documents: any[]) {
        for (const document of documents) {
            try {
                importQueue.add(new ImportDocument(document.id, ImportDocumentType.PARLIAMENT));
                this.numberOfSuccesses++;
            } catch (error) {
                logger.error("Could not process the document.", { documentId: document.id, error });
                this.numberOfErrors++;
            }
        }
    }

}

export const importPublishServiceParliament = new ImportPublishServiceParliament();
