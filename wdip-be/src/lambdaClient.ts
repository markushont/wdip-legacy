import { Lambda as AWSLambda } from "aws-sdk";
import config from "./config/config";
// TODO: dynamically import MockLambda depending on env
import MockLambda from "./mock/MockLambda";

const lambdaClient = !config.WDIP_IS_LOCAL_ENV ?
    new AWSLambda({ region: config.AWS_REGION }) : new MockLambda();

export default lambdaClient;
