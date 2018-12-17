import { SQS } from "aws-sdk";
import moment, { Moment } from "moment";
const BASE_10 = 10;

export interface QueueStatus {
    queueName: string;
    created: Moment;
    delaySeconds: number;
    receiveMessageWaitTimeSeconds: number;
    approximateNumberOfMessages: number;
    approximateNumberOfMessagesDelayed: number;
    approximateNumberOfMessagesNotVisible: number;
    queueArn: string;
}

export function transformFromSqs(sqsAttributes: SQS.QueueAttributeMap) {
    return {
        created: moment.utc(),
        delaySeconds: parseInt(sqsAttributes.DelaySeconds, BASE_10),
        receiveMessageWaitTimeSeconds: parseInt(sqsAttributes.ReceiveMessageWaitTimeSeconds, BASE_10),
        approximateNumberOfMessages: parseInt(sqsAttributes.ApproximateNumberOfMessages, BASE_10),
        approximateNumberOfMessagesDelayed: parseInt(sqsAttributes.ApproximateNumberOfMessagesDelayed, BASE_10),
        approximateNumberOfMessagesNotVisible: parseInt(sqsAttributes.ApproximateNumberOfMessagesNotVisible, BASE_10),
        queueArn: sqsAttributes.QueueArn
    };
}
