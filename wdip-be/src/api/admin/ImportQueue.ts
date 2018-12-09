import { config, Credentials, SQS } from "aws-sdk";
import { SendMessageRequest } from "aws-sdk/clients/sqs";
import { $enum } from "ts-enum-util";
import { SQS_URL } from "../../config/config";
import logger from "../../logger";
import { ImportDocument } from "./ImportDocument";

class ImportQueue {

    private queue = new SQS({ apiVersion: "2012-11-05", region: "eu-west-1" });

    constructor() {
        config.update({
            region: "eu-west-1",
            credentials: new Credentials("access", "secret")
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
}

export const importQueue = new ImportQueue();
