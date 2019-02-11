import { Lambda as AWSLambda } from "aws-sdk";
import config from "../config/config";
import { adminStartImport, startUpdateImport } from "../importHandler";
import MockLambdaPromise from "./MockLambdaPromise";

/**
 * Mocks lambda invokation on a per-function basis. This is because serverless-offline
 * lacks support for invoking lambdas from within another lambda.
 */
export default class MockLambda {
    public invoke(params: AWSLambda.InvocationRequest): MockLambdaPromise {
        const payloadObj = params.Payload ? JSON.parse(params.Payload.toString()) : {};
        switch (params.FunctionName) {
            case `${config.AWS_APPLICATION_NAME}-adminStartImport`:
                return adminStartImport(payloadObj, {}) as MockLambdaPromise;
            case `${config.AWS_APPLICATION_NAME}-adminStartUpdateImport`:
                return startUpdateImport(payloadObj, {}) as MockLambdaPromise;
            default:
                return null;
        }
    }
}
