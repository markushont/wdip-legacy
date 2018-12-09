// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
const { SQS_URL } = require("../../config/config");
const util = require("util");
const logger = require("../../logger");

AWS.config.update({
    region: "eu-west-1",
    endpoint: "http://sqs:8000"
});

// Create an SQS service object
var sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

var params = {
    AttributeNames: [
        "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
        "All"
    ],
    QueueUrl: SQS_URL,
    // VisibilityTimeout: 20,
    WaitTimeSeconds: 0
};

sqs.receiveMessage(params, (err, data) => {
    if (err) {
        logger.error("Receive Error", err);
    } else if (data.Messages) {
        logger.info(util.inspect(data));
        var deleteParams = {
            QueueUrl: SQS_URL,
            ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        sqs.deleteMessage(deleteParams, (err2, data2) => {
            if (err2) {
                logger.error("Delete Error", err2);
            } else {
                logger.info("Message Deleted", data2);
            }
        });
    }
});
