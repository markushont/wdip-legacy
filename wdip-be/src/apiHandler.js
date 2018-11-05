"use strict";

const getMotionsByParty = require("./api/getMotionsByParty");
const motions = require("./api/motions");
import getWordCloud from "./api/getWordCloud";
const logger = require("./logger");

/**
 * Base response HTTP headers
 */
const responseHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",        // Required for CORS support to work
    "Access-Control-Allow-Credentials": true   // Required for cookies, authorization headers with HTTPS
};

/**
 * HTTP response templates
 */
const responses = {
    success: (data = {}, code = 200) => {
        return {
            "statusCode": code,
            "headers": responseHeaders,
            "body": JSON.stringify(data)
        };
    },
    error: (error) => {
        return {
            "statusCode": error.code || 500,
            "headers": responseHeaders,
            "body": JSON.stringify(error)
        };
    }
};

module.exports.getMotionsByParty = async (event, context) => {
    var fromDate = event.queryStringParameters.fromDate;
    var toDate = event.queryStringParameters.toDate;
    let result = await getMotionsByParty(fromDate, toDate);
    return responses.success(result);
};

module.exports.getMotionById = async (event, context) => {
    var id = event.pathParameters.id;
    let result = await motions.byId(id);
    return responses.success(result);
};

module.exports.getPendingMotions = async (event, context) => {
    let result = await motions.pending();
    return responses.success(result);
};

module.exports.getWordCloud = async (event, context) => {
    let result = await getWordCloud();
    return responses.success(result);
};
