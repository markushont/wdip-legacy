const elasticsearch = require("elasticsearch");
const { ES_SERVER } = require("./config/config");

let client = new elasticsearch.Client({
    host: ES_SERVER,
    log: "info"
});

module.exports = client;
