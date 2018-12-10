import { config, Credentials, SQS } from "aws-sdk";
import { DeleteMessageRequest, SendMessageRequest } from "aws-sdk/clients/sqs";
import { SQS_URL } from "../../config/config";
import logger from "../../logger";
import { ImportDocument } from "./ImportDocument";

class ImportQueue {

    private queue = new SQS({ apiVersion: "2012-11-05", region: "eu-west-1" });

    constructor() {
        config.update({
            region: "eu-west-1"
        });
    }

    /**
     * Adds the given document to the import queue for later processing.
     * @param doc the document to add
     * @throws exception if the document could not be added
     */
    public async add(doc: ImportDocument) {
        const message: SendMessageRequest = {
            MessageBody: doc.serialize(),
            QueueUrl: SQS_URL
        };

        const data = await this.queue.sendMessage(message).promise();
        logger.debug("Document successfully added to the import queue.", data);
    }

    /**
     * Deletes a message from the import queue.
     * @param receiptHandle the receipt handle for the message to delete
     */
    public async delete(receiptHandle: string) {
        const message: DeleteMessageRequest = {
            ReceiptHandle: receiptHandle,
            QueueUrl: SQS_URL
        };
        await this.queue.deleteMessage(message).promise();
    }
}

export const importQueue = new ImportQueue();
