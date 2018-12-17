import { QUEUE_STATUS_INDEX } from "../config/config";
import dbClient from "../dbclient";
import logger from "../logger";
import { transformFromSqs } from "../models/QueueStatus";
import { importQueue } from "./ImportQueue";

class ImportQueueStatus {

    public async logStatus() {
        try {
            const attributes = await importQueue.getStatus();
            await dbClient.index({
                index: QUEUE_STATUS_INDEX,
                type: "sqs-status",
                body: transformFromSqs(attributes)
            });
            logger.debug("Import queue status successfully logged.");
        } catch (error) {
            logger.error("There was an error logging the queue status.", { error });
        }
    }

}

export const importQueueStatus = new ImportQueueStatus();
