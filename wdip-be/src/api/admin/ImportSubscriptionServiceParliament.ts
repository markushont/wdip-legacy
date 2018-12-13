import { Message, MessageList, ReceiveMessageResult } from "aws-sdk/clients/sqs";
import axios from "axios";
import { WDIP_MOTION_INDEX } from "../../config/config";
import dbClient from "../../dbclient";
import logger from "../../logger";
import { ImportDocument } from "./ImportDocument";
import { importQueue } from "./ImportQueue";
import { transformMotionDocument } from "./models/MotionDocument";

class ImportSubscriptionServiceParliament {

    public receiveImportDocumentEvent(event: any) {

        logger.debug("Recieved event.", event);

        if (!event || !event.Records) { return; }

        // We expect only one message in the event, but let's be on the safe side.
        for (const record of event.Records) {
            this.processEventMessage(this.parseToMessage(record));
        }
    }

    /**
     * Processes the given queue message by fetching data from the source, transposing it to the
     * internal WDIP format, storing it in the WDIP database and finally deleting the message from
     * the queue.
     * @param message the message from the queue
     */
    private async processEventMessage(message: Message) {
        try {
            const importDocument = ImportDocument.deserialize(message.Body);

            // 1. Fetch the document
            const sourceStatus = await this.fetchDocumentStatus(importDocument);
            const sourceFullText = await this.fetchDocumentFullText(sourceStatus.dokument.dokument_url_text);

            // 2. Transpose the document to WDIP format
            const motion = transformMotionDocument(sourceStatus);
            motion.fullText = sourceFullText;

            // 3. Store the document in ES
            dbClient.index({ index: WDIP_MOTION_INDEX, type: motion.documentType, body: motion });

            // 4. Delete the message from the queue (if successful)
            importQueue.delete(message.ReceiptHandle);
        } catch (error) {
            logger.error("There was an error processing the event message.", { error: error.message });
        }
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

    private parseToMessage(message: any): Message {
        const outMessage: Message = {};
        outMessage.MessageId = message.messageId;
        outMessage.ReceiptHandle = message.receiptHandle;
        outMessage.Body = message.body;
        return outMessage;
    }

}

export const importSubscriptionServiceParliament = new ImportSubscriptionServiceParliament();
