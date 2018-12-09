var AWS = require("aws-sdk");
const { SQS_URL } = require("../../config/config");
const logger = require("../../logger");

AWS.config.update({
    region: "eu-west-1",
    endpoint: "http://sqs:8000"
});

var sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
var params = {
    //    DelaySeconds: 10,
    MessageAttributes: {
        "Title": {
            DataType: "String",
            StringValue: "The Whistler"
        },
        "Author": {
            DataType: "String",
            StringValue: "John Grisham"
        },
        "WeeksOn": {
            DataType: "Number",
            StringValue: "6"
        }
    },
    MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    QueueUrl: SQS_URL
};

// tslint:disable-next-line:max-line-length
// aws --endpoint-url http://localhost:9324 sqs receive-message --queue-url http://localhost:9324/queue/default --wait-time-seconds 10

sqs.sendMessage(params, (err, data) => {
    if (err) {
        logger.error("Error", err);
    } else {
        logger.info("Success", data.MessageId);
    }
});
