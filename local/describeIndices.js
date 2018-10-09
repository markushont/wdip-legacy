const client = require('./connection.js');
const { indices } = require('./constants');
const logger = require('./logger');

async function describeIndices() {
  Object.keys(indices).forEach(index => describeIndex(indices[index]));
}

async function describeIndex(indexName) {
  try {
    let params = { index: indexName };
    let exists = await client.indices.exists(params);
    if (exists) {
      let result = await client.indices.get(params);
      logger.info(`Index "${indexName}" is defined.`, result);
    }
    else
      logger.info(`Index "${indexName}" does not exist.`)
  } catch (error) {
    logger.error(error);
  }
}

describeIndices();
