'use strict';

const dbClient = require('../dbclient');
const { WDIP_MOTION_INDEX } = require('../config/config');
const logger = require('../logger');

async function getMotionById(id) {
    logger.debug(`Will query for motion ${id}.`);

    const params = {
        index: WDIP_MOTION_INDEX,
        type: 'docs',
        id: id
    }

    try {
        const doc = await dbClient.get(params);
        logger.debug('Got document.', doc);
        return doc;
    }
    catch (error) {
        logger.error(`Failed to query table ${WDIP_MOTION_INDEX}.`, error);
        return null;
    }
};

async function getPendingMotions() {
    logger.debug('Getting pending motions from index.');

    const params = {
        index: WDIP_MOTION_INDEX,
        q: 'isPending:x'
    };

    try {
        const response = await client.search(params);
        let pendingIds = response.map(({ _id }) => _id);
        logger.debug('Pending motions: ', pendingIds);
        return pendingIds;
    }
    catch (error) {
        logger.error('Failed to query pending motions.', error);
        return null;
    }
};

module.exports = { byId: getMotionById, pending: getPendingMotions }