import axios from "axios";
import { parseUrl, stringify } from "query-string";
import config from "../config/config";
import dbClient from "../dbclient";
import logger from "../logger";
import { ImportDocument, ImportDocumentType } from "./ImportDocument";
import { ImportPublicationService } from "./ImportPublicationService";
import { importQueue } from "./ImportQueue";

/**
 * Handles the job for importing documents from the parliament to the WDIP database by
 * running searches against the public API and publishing document events on the import
 * queue. The events on the queue are handled separately and allows us to scale the
 * import by having multiple workers picking up the events.
 */
export abstract class IPSParliament extends ImportPublicationService {

    /**
     * Logs the current status of the import job to the database for monitoring.
     */
    protected async logStatus() {
        try {
            const status = this.getStatus();
            await dbClient.index({
                index: config.STATUS_INDEX_IPS,
                type: config.STATUS_INDEX_IPS,
                body: status
            });
            logger.debug("Import publication service status successfully logged.");
        } catch (error) {
            logger.error("There was an error logging the import publication service status.", { error });
        }
    }

    /**
     * Fetches data from the given search url and adds the result to the processing queue. The search
     * recursively calls itself as long as the url to the next search result page is present. When the
     * {isStopRequested} attribute is set, the recursion will stop as well.
     * @param url the search url to fetch
     */
    protected async search(url: string = null) {
        // Halt the execution if stop is requested or there is no url
        if (this.isStopRequested || !url) { return; }

        // Fetch the search url and process the result
        try {
            logger.debug("Fetching data.", { url });
            const response = await axios.get(url);

            this.processDocuments(response.data.dokumentlista.dokument);

            // Recursively fetch the next page of documents. Note that the last page does not
            // contain the '@nasta_sida' property, causing the recursion to stop.
            const newUrl = this.trimParliamentUrl(response.data.dokumentlista["@nasta_sida"]);
            await this.search(newUrl);
        } catch (error) {
            logger.error("There was an error fetching documents. Aborting import job.", error);
            return;
        }
    }

    /**
     * Processes the given documents by adding them to the import queue.
     * @param documents list of documents to be processed
     */
    protected processDocuments(documents: any[]) {
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

    /**
     * Trims the given url by removing unnecessary parameters. For long running queries,
     * these parameters will otherwise grow by each page fetched from the search API.
     * @param inputUrl the url from the previous search result
     */
    private trimParliamentUrl(inputUrl: string): string {
        const parsed = parseUrl(inputUrl);
        delete parsed.query.u17;
        delete parsed.query.caller;
        return parsed.url + "?" + stringify(parsed.query);
    }

}
