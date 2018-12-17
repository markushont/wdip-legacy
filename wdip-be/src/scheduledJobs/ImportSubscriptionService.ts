import { Message } from "aws-sdk/clients/sqs";
import logger = require("../logger");
import { importQueue } from "./ImportQueue";

export abstract class ImportSubscriptionService {

    /**
     * Handles an event from the import queue by extracting and processing all messages.
     * @param event the event from the import queue
     */
    public async processEvent(event: any) {
        logger.debug("Received event.", event);

        if (!event || !event.Records) { return; }

        // The event may contain several messages. Loop through them all.
        for (const record of event.Records) {
            try {
                // Parse and process the message.
                const message = this.parseToMessage(record);
                await this.processEventMessage(message);

                // Delete the message from the queue
                await importQueue.delete(message.ReceiptHandle);
            } catch (error) {
                logger.error("There was an error processing the event message.", { record, error: error.message });
            }
        }
    }

    /**
     * Processes the given queue message by fetching data from the source, transposing it to the
     * internal WDIP format, storing it in the WDIP database.
     * @param message the message to be processed
     * @throws exception when an error occurs, indicating that the message has not been processed
     */
    public abstract async processEventMessage(message: Message): Promise<void>;

    /**
     * Parses a raw message from the import queue to a SQS Message object.
     * @param message the raw message to be parsed
     */
    private parseToMessage(message: any): Message {
        const outMessage: Message = {};
        outMessage.MessageId = message.messageId;
        outMessage.ReceiptHandle = message.receiptHandle;
        outMessage.Body = message.body;
        return outMessage;
    }

}
