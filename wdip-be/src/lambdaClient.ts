import { Lambda as AWSLambda } from "aws-sdk";
import axios from "axios";
import { stringify } from "query-string";
import config from "./config/config";

/**
 * Mocks lambda invokation on a per-function basis. This is because serverless-offline
 * lacks support for invoking lambdas from within another lambda.
 */
class MockLambda {
    public invoke(params: AWSLambda.InvocationRequest) {
        const payloadObj = params.Payload ? JSON.parse(params.Payload.toString()) : null;
        switch (params.FunctionName) {
            case `${config.AWS_APPLICATION_NAME}-adminContinueImport`:
                const startUrl = encodeURI(payloadObj.queryStringParameters.startUrl || "");
                const documentType = payloadObj.queryStringParameters.documentType;
                if (startUrl && startUrl.length) {
                    const queryParams = { startUrl, documentType };
                    const requestUrl = `http://localhost:3001/admin/import/continue?${stringify(queryParams)}`;
                    axios.post(requestUrl);
                }
                break;
            default:
                break;
        }
    }
}

// Use mocked endpoints if running locally
const lambda = !config.WDIP_IS_LOCAL_ENV ? new AWSLambda({ region: "test" }) : new MockLambda();

export default lambda;
