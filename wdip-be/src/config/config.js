const defaultConfig = {
    AWS_APPLICATION_NAME: "wdip-be-local",
    AWS_REGION: "eu-west-1",
    ES_SERVER: "elasticsearch:9200",
    SQS_URL: "http://sqs:9324/queue/wdip-import-local",
    STATUS_INDEX_IPS: "status-ips",
    STATUS_INDEX_SQS: "status-sqs",
    STATUS_INTERVAL_IPS_MS: 1000,
    WDIP_DEFAULT_PARTIES: ["s", "m", "l", "kd", "v", "sd", "c", "mp"],
    WDIP_IS_LOCAL_ENV: false,
    WDIP_MOTION_INDEX: "motions"
};

const config = {};
for (const key of Object.keys(defaultConfig)) {
    config[key] = process.env[key] || defaultConfig[key];
}

export default config;
