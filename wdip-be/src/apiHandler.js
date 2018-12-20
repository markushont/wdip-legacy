"use strict";

const getMotionsByParty = require("./api/getMotionsByParty");
const motions = require("./api/motions");
import getWordCloud from "./api/getWordCloud";
import { ipsParliamentDateRange } from "./scheduledJobs/IPSParliamentDateRange";
const moment = require("moment");
const getAllParties = require("./api/getAllParties");

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
    var fromDate = event.queryStringParameters.fromDate;
    var toDate = event.queryStringParameters.toDate;
    let result = await getWordCloud(fromDate, toDate);
    return responses.success(result);
};

module.exports.getAllParties = async (event, context) => {
    let result = await getAllParties();
    return responses.success(result);
};

module.exports.adminStartImport = async (event, context) => {
    const fromDate = moment(event.queryStringParameters.fromDate);
    const toDate = moment(event.queryStringParameters.toDate);
    ipsParliamentDateRange.start(fromDate, toDate);
    return responses.success({}, 202);
};
