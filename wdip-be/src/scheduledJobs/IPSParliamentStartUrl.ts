import { getDocumentTypeString } from "../models/DocumentType";
import { IPSParliament } from "./IPSParliament";

/**
 * Handles the job for importing documents from the parliament to the WDIP database by
 * running searches against the public API and publishing document events on the import
 * queue. The events on the queue are handled separately and allows us to scale the
 * import by having multiple workers picking up the events.
 */
export class IPSParliamentStartUrl extends IPSParliament {

    /**
     * Returns a start search url (if it's a valid IPSParliament url).
     * @param startUrl possible start URL
     */
    protected getStartUrl(startUrl: string): string {
        if (!startUrl || !startUrl.length) { return null; }

        const docTypeString = getDocumentTypeString(this.documentType);
        const regex = RegExp(`^http://data.riksdagen.se/dokumentlista/.*doktyp=${docTypeString}.*$`);
        return regex.test(startUrl) ? startUrl : null;
    }

}
