"use strict";

import getAllParties from "./api/getAllParties";
import getMotionsByParty from "./api/getMotionsByParty";
import getWordCloud from "./api/getWordCloud";
import { getMotionById, getPendingMotions } from "./api/motions";
import httpResponses from "./httpResponses";

module.exports.getMotionsByParty = async (event, context) => {
    const fromDate = event.queryStringParameters.fromDate;
    const toDate = event.queryStringParameters.toDate;
    const result = await getMotionsByParty(fromDate, toDate);
    return httpResponses.success(result);
};

module.exports.getMotionById = async (event, context) => {
    const id = event.pathParameters.id;
    const result = await getMotionById(id);
    return httpResponses.success(result);
};

module.exports.getPendingMotions = async (event, context) => {
    const result = await getPendingMotions();
    return httpResponses.success(result);
};

module.exports.getWordCloud = async (event, context) => {
    const fromDate = event.queryStringParameters.fromDate;
    const toDate = event.queryStringParameters.toDate;
    const result = await getWordCloud(fromDate, toDate);
    return httpResponses.success(result);
};

module.exports.getAllParties = async (event, context) => {
    const result = await getAllParties();
    return httpResponses.success(result);
};
