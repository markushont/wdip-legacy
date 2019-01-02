"use strict";

import config from "../config/config";
import dbClient from "../dbclient";
import logger from "../logger";
import { DocumentStatus } from "../models/DocumentStatus";
import { DocumentType } from "../models/DocumentType";

export async function getMotionById(id: string) {
    logger.debug(`Will query for motion ${id}.`);

    const params = {
        index: config.WDIP_MOTION_INDEX,
        type: DocumentType.MOTION,
        id
    };

    try {
        const doc = await dbClient.get(params);
        logger.debug("Got document.", doc);
        return doc;
    } catch (error) {
        logger.error(`Failed to query table ${config.WDIP_MOTION_INDEX}.`, error);
        return null;
    }
}

export async function getPendingMotions() {
    logger.debug("Getting pending motions from index.");

    const params = {
        index: config.WDIP_MOTION_INDEX,
        q: `documentStatus:${DocumentStatus.PENDING}`
    };

    try {
        const response = await dbClient.search(params);
        const pendingIds = response.hits.hits.map(({ _id }) => _id);
        logger.debug("Pending motions: ", pendingIds);
        return pendingIds;
    } catch (error) {
        logger.error("Failed to query pending motions.", error);
        return null;
    }
}
