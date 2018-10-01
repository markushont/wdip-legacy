'use strict';

var AWS = require('aws-sdk');

// Point to local DB instance
if (process.env.IS_OFFLINE || process.env.IS_LOCAL) {
    AWS.config.update({
        region: "eu-west-1",
        endpoint: "http://localhost:8000"
    });
}

var dynamoDb = new AWS.DynamoDB();
var documentClient = new AWS.DynamoDB.DocumentClient();

const motionTableName = process.env.MOTION_TABLE;

async function getMotionById(id) {
    console.log("Will query for motion " + id)
    const requestMotionParams = {
        TableName: motionTableName,
        Key: {
            dok_id: id
        }
    };

    return await documentClient.get(requestMotionParams).promise()
        .then(data => {
            console.log("Got: " + JSON.stringify(data));
            return data.Item;
        })
        .catch(err => {
            console.error("Failed to query table " +
                process.env.MOTION_TABLE + "\nReason: " + err);
            return null;
        });
};

module.exports = {byId:getMotionById}