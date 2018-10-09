const elasticsearch = require('elasticsearch');
const { constants, indices } = require('./constants');

let client = new elasticsearch.Client({
    host: constants.LOCAL_DB_PATH,
    log: 'info'
});

module.exports = client;
