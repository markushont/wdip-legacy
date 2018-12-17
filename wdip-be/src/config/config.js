// import loadJsonFile from "load-json-file";

// const config = loadJsonFile.sync("./environment.json");

// Object.keys(config).forEach(key => {
//     config[key] = process.env[key] || config[key];
// });

// module.exports = config;

module.exports = {
    "ES_SERVER": "elasticsearch:9200",
    "ES_USERNAME": null,
    "ES_PASSWORD": null,
    "WDIP_MOTION_INDEX": "motions",
    "WDIP_MOTION_REQUEST_LOG_INDEX": "motion-request-log",
    "WDIP_DEFAULT_PARTIES": ["s", "m", "l", "kd", "v", "sd", "c", "mp"],
    "QUEUE_STATUS_INDEX": "sqs-status",
    "MAX_PAGINATED_PAGES": 400,
    "DATE_ZERO": "2000-01-01",
    "FETCH_MOTIONS": true,
    "FETCH_PROPOSITIONS": false,
    "SQS_URL": "http://sqs:9324/queue/wdip-import"
};
