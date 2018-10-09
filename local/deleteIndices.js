const client = require('./connection.js');
const { constants, indices } = require('./constants');
const logger = require('./logger');

async function deleteIndices() {
    Object.keys(indices).forEach(index => deleteIndex(indices[index]));
}

async function deleteIndex(indexName) {
    try {
        let params = { index: indexName };
        let exists = await client.indices.exists(params);
        if (exists) {
            await client.indices.delete(params);
            logger.info(`Deleted index "${indexName}".`)
        }
        else
            logger.info(`Index "${indexName}" did not exist.`);
    } catch (error) {
        logger.error(error);
    }
}

deleteIndices();
