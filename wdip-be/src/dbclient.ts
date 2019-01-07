import AWS from "aws-sdk";
import { Client } from "elasticsearch";
import connectionClass from "http-aws-es";
import config from "./config/config";

const options = {
    hosts: [config.ES_SERVER],
    log: "error",
    connectionClass,
    awsConfig: new AWS.Config({
        region: config.AWS_REGION,
        credentials: new AWS.EnvironmentCredentials("AWS")
    })
};

const dbClient = new Client(options);

export default dbClient;
