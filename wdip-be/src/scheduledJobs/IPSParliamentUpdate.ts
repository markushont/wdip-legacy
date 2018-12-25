import { Moment } from "moment";
import { stringify } from "query-string";
import { IPSParliament } from "./IPSParliament";

/**
 * Handles the job for importing documents from the parliament to the WDIP database by
 * running searches against the public API and publishing document events on the import
 * queue. The events on the queue are handled separately and allows us to scale the
 * import by having multiple workers picking up the events.
 *
 * This subclass handles updates from a certain date. The Parliament API has a field
 * called systemdatum, which is set everytime a document is updated. The search API
 * only allows us to set a from-date when using the systemdatum.
 */
class IPSParliamentUpdate extends IPSParliament {

    /**
     * Returns a start search url, given the input date.
     * @param from the date to search from
     */
    protected getStartUrl(from: Moment): string {
        const queryParams = {
            doktyp: "mot",
            ts: from.format("YYYY-MM-DD"), // systemdatum
            sort: "datum",
            sortorder: "asc",
            utformat: "json"
        };

        return `http://data.riksdagen.se/dokumentlista/?${stringify(queryParams)}`;
    }

}

export const ipsParliamentUpdate = new IPSParliamentUpdate();
