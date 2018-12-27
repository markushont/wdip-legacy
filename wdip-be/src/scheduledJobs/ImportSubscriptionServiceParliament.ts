import { Message } from "aws-sdk/clients/sqs";
import axios from "axios";
import config from "../config/config";
import dbClient from "../dbclient";
import logger from "../logger";
import { transformMotionDocument } from "../models/MotionDocument";
import { ImportDocument } from "./ImportDocument";
import { ImportSubscriptionService } from "./ImportSubscriptionService";

class ImportSubscriptionServiceParliament extends ImportSubscriptionService {

    public async processEventMessage(message: Message) {
        const importDocument = ImportDocument.deserialize(message.Body);

        // 1. Fetch the document
        const sourceStatus = await this.fetchDocumentStatus(importDocument);
        const sourceFullText = await this.fetchDocumentFullText(sourceStatus.dokument.dokument_url_text);

        // 2. Transpose the document to WDIP format
        const motion = transformMotionDocument(sourceStatus);
        motion.fullText = sourceFullText;

        // 3. Store the document in ES
        // TODO: 'type' needs to be something more general but ES6 and newer allows for
        //       only one type per index. Introduce breaking changes in separate feature?
        dbClient.index({ index: config.WDIP_MOTION_INDEX, id: motion.id, type: "MOTION", body: motion });
    }

    private async fetchDocumentStatus(importDocument: ImportDocument): Promise<any> {
        const url = `http://data.riksdagen.se/dokumentstatus/${importDocument.id}.json`;
        logger.debug("Fetching document status.", { url });
        const response = await axios.get(url);
        return response.data.dokumentstatus;
    }

    private async fetchDocumentFullText(url: string): Promise<string> {
        logger.debug("Fetching document full text.", { url });
        const response = await axios.get(url);
        return response.data;
    }

}

export const importSubscriptionServiceParliament = new ImportSubscriptionServiceParliament();
