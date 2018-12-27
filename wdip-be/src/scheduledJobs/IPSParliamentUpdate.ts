import { Moment } from "moment";
import { stringify } from "query-string";
import { getDocumentTypeString } from "../models/DocumentType";
import { IPSParliament } from "./IPSParliament";

/**
 * Handles the job for importing documents from the parliament to the WDIP database by
 * running searches against the public API and publishing document events on the import
 * queue. The events on the queue are handled separately and allows us to scale the
 * import by having multiple workers picking up the events.
 */
export class IPSParliamentUpdate extends IPSParliament {

    /**
     * Returns a start search url, given the input date.
     * @param from the date to search from
     */
    protected getStartUrl(from: Moment): string {
        const queryParams = {
            doktyp: getDocumentTypeString(this.documentType),
            systemdatum: from.format("YYYY-MM-DD"),
            sort: "datum",
            sortorder: "asc",
            utformat: "json"
        };

        return `http://data.riksdagen.se/dokumentlista/?${stringify(queryParams)}`;
    }

}
