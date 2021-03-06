import { config as awsConfig, SQS } from "aws-sdk";
import { DeleteMessageRequest, GetQueueAttributesRequest, SendMessageRequest } from "aws-sdk/clients/sqs";
import config from "../config/config";
import logger from "../logger";
import { ImportDocument } from "./ImportDocument";

class ImportQueue {

    private queue = new SQS({ apiVersion: "2012-11-05", region: "eu-west-1" });

    constructor() {
        awsConfig.update({
            region: config.AWS_REGION
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
            QueueUrl: config.SQS_URL
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
            QueueUrl: config.SQS_URL
        };
        await this.queue.deleteMessage(message).promise();
        logger.debug("Message successfully deleted from the import queue.", { receiptHandle });
    }

    /**
     * Gets status attributes, such as number of unprocessed messages, for the import queue.
     */
    public async getStatus() {
        const params: GetQueueAttributesRequest = {
            AttributeNames: ["All"],
            QueueUrl: config.SQS_URL
        };
        const { Attributes } = await this.queue.getQueueAttributes(params).promise();
        return Attributes;
    }

}

export const importQueue = new ImportQueue();
