import { Config, EnvironmentCredentials } from "aws-sdk";
import { Client } from "elasticsearch";
import connectionClass from "http-aws-es";
import config from "./config/config";

// No need for awsConfig if we're running locally
let awsConfig = null;
if (!config.WDIP_IS_LOCAL_ENV) {
    awsConfig = new Config({
        region: config.AWS_REGION,
        credentials: new EnvironmentCredentials("AWS")
    });
}

const options = {
    hosts: [config.ES_SERVER],
    log: "error",
    connectionClass,
    awsConfig
};

const dbClient = new Client(options);

export default dbClient;
