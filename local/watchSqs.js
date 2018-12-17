const aws = require("aws-sdk");
const es = require('elasticsearch');

const sqs = new aws.SQS({ apiVersion: "2012-11-05", region: "eu-west-1" });
aws.config.update({
    region: "eu-west-1"
});

const dbClient = new es.Client({
    host: "localhost:9200",
    log: "info"
});

setInterval(async () => {
    try {
        const { Attributes } = await sqs.getQueueAttributes({ QueueUrl: "http://localhost:9324/queue/wdip-import", AttributeNames: ["All"] }).promise();
        dbClient.index(
            {
                index: "sqs",
                type: "sqs-status",
                body: transpose(Attributes)
            });
    } catch (error) {
        console.error(error);
    }
}, 1000);

function transpose(sqsAttributes) {
    return {
        created: new Date(),
        delaySeconds: parseInt(sqsAttributes.DelaySeconds),
        receiveMessageWaitTimeSeconds: parseInt(sqsAttributes.ReceiveMessageWaitTimeSeconds),
        approximateNumberOfMessages: parseInt(sqsAttributes.ApproximateNumberOfMessages),
        approximateNumberOfMessagesDelayed: parseInt(sqsAttributes.ApproximateNumberOfMessagesDelayed),
        approximateNumberOfMessagesNotVisible: parseInt(sqsAttributes.ApproximateNumberOfMessagesNotVisible),
        queueArn: sqsAttributes.QueueArn
    };
}
