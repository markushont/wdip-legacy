const elasticsearch = require('elasticsearch');
const { constants, indices } = require('./constants');
const logger = require('./logger');

let client = new elasticsearch.Client({
    host: constants.LOCAL_DB_PATH,
    log: 'info'
});

async function createIndices() {
    Object.keys(indices).forEach(index => createIndex(indices[index]));
}

async function createIndex(indexName) {
    try {
        let params = { index: indexName };
        let exists = await client.indices.exists(params);
        if (!exists) {
            await client.indices.create(params);
            logger.info(`Created index "${indexName}".`)
        }
        else
            logger.info(`Index "${indexName}" already exists`);
    } catch (error) {
        logger.error(error);
    }
}

createIndices();
