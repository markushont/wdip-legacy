const defaultConfig = {
    "AWS_REGION": "eu-west-1",
    "ES_SERVER": "elasticsearch:9200",
    "ES_USERNAME": null,
    "ES_PASSWORD": null,
    "WDIP_MOTION_INDEX": "motions",
    "WDIP_MOTION_REQUEST_LOG_INDEX": "motion-request-log",
    "WDIP_DEFAULT_PARTIES": ["s", "m", "l", "kd", "v", "sd", "c", "mp"],
    "STATUS_INDEX_SQS": "status-sqs",
    "STATUS_INDEX_IPS": "status-ips",
    "STATUS_INTERVAL_IPS_MS": 1000,
    "SQS_URL": "http://sqs:9324/queue/wdip-import-local"
};

const config = {};
for (const key of Object.keys(defaultConfig)) {
    config[key] = process.env[key] || defaultConfig[key];
}

export default config;
