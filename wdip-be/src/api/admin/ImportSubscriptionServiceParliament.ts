import { Message, MessageList, ReceiveMessageResult } from "aws-sdk/clients/sqs";
import axios from "axios";
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
            const sourceStatus = await axios.get(`http://data.riksdagen.se/dokumentstatus/${importDocument.id}`);
            const sourceText = await axios.get(sourceStatus.data.dokumentStatus.dokument);

            // 2. Transpose the document to WDIP format
            const motion = transformMotionDocument(sourceStatus.data.dokumentStatus);
            motion.fullText = sourceText.data;

            // 3. Store the document in ES
            // TODO

            // 4. Delete the message from the queue (if successful)
            importQueue.delete(message.ReceiptHandle);
        } catch (error) {
            logger.error("There was an error processing the event message.", { error });
        }
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
