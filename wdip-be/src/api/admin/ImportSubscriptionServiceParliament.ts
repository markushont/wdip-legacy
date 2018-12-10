import { Message, MessageList, ReceiveMessageResult } from "aws-sdk/clients/sqs";
import logger from "../../logger";
import { ImportDocument } from "./ImportDocument";
import { importQueue } from "./ImportQueue";

class ImportSubscriptionServiceParliament {

    public receiveImportDocumentEvent(event: any) {

        logger.debug("Recieved event.", event);

        if (!event || !event.Records) { return; }

        // We expect only one message in the event, but let's be on the safe side.
        for (const record of event.Records) {
            this.processEventMessage(this.parseToMessage(record));
        }
    }

    // tslint:disable-next-line:max-line-length
    // {"Records":[{"messageId":"4b009e11-ee83-4479-8af8-f27ed8229dd9","receiptHandle":"4b009e11-ee83-4479-8af8-f27ed8229dd9#2ee87f40-a14d-4031-a065-85f695575f33","body":"{\"id\":\"H5023963\",\"type\":\"PARLIAMENT\"}","attributes":{"SentTimestamp":"1544425022422","ApproximateReceiveCount":"11","ApproximateFirstReceiveTimestamp":"1544425022505","SenderId":"127.0.0.1","MessageDeduplicationId":"","MessageGroupId":""},"md5OfBody":"3cc00f5ce24315e6ce64ebfcb01838da","eventSource":"aws:sqs","eventSourceARN":"arn:aws:sqs:eu-west-1:843375259671:wdip-import","awsRegion":"us-west-2"}],"timestamp":"2018-12-10T06:57:02.789Z"}

    /**
     * Processes the given queue message by fetching data from the source, transposing it to the
     * internal WDIP format, storing it in the WDIP database and finally deleting the message from
     * the queue.
     * @param message the message from the queue
     */
    private processEventMessage(message: Message) {
        try {
            const document = ImportDocument.deserialize(message.Body);
            // 1. Fetch the document
            this.fetchDocument(document);

            // 2. Transpose the document to WDIP format

            // 3. Store the document in ES

            // 4. Delete the message from the queue (if successful)
            importQueue.delete(message.ReceiptHandle);
        } catch (error) {
            logger.error("There was an error processing the event message.", { error });
        }
    }

    private fetchDocument(document: ImportDocument) {
        // TODO
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
