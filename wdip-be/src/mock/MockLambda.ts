import { Lambda as AWSLambda } from "aws-sdk";
import axios from "axios";
import { stringify } from "query-string";
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
            case `${config.AWS_APPLICATION_NAME}-adminContinueImport`:
                const startUrl = encodeURI(payloadObj.queryStringParameters.startUrl || "");
                const documentType = payloadObj.queryStringParameters.documentType;
                if (startUrl && startUrl.length) {
                    const queryParams = { startUrl, documentType };
                    const requestUrl = `http://localhost:3001/admin/import/continue?${stringify(queryParams)}`;
                    return axios.post(requestUrl) as MockLambdaPromise;
                }
                break;
            case `${config.AWS_APPLICATION_NAME}-adminStartImport`:
                return adminStartImport(payloadObj, {}) as MockLambdaPromise;
            case `${config.AWS_APPLICATION_NAME}=adminStartUpdateImport`:
                return startUpdateImport(payloadObj, {}) as MockLambdaPromise;
            default:
                break;
        }
    }
}
