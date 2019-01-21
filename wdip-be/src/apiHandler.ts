"use strict";

import moment from "moment";
import getAllParties from "./api/getAllParties";
import getMotionsByParty from "./api/getMotionsByParty";
import getWordCloud from "./api/getWordCloud";
import { getMotionById, getPendingMotions } from "./api/motions";
import httpResponses from "./httpResponses";

module.exports.getMotionsByParty = async (event, context) => {
    const today = moment();
    let fromDate  = today.format("YYYY-MM-DD"); // defaults to today
    let toDate = today.subtract(1, "month").format("YYYY-MM-DD"); // defaults to last month

    if (event && event.queryStringParameters) {
        fromDate = event.queryStringParameters.fromDate || fromDate;
        toDate = event.queryStringParameters.toDate || toDate;
    }

    try {
        const result = await getMotionsByParty(fromDate, toDate);
        return httpResponses.success(result);
    } catch (error) {
        return httpResponses.error(error);
    }
};

module.exports.getMotionById = async (event, context) => {
    try {
        const id = decodeURIComponent(event.pathParameters.id);
        const result = await getMotionById(id);
        return httpResponses.success(result);
    } catch (error) {
        return httpResponses.error(error);
    }
};

module.exports.getPendingMotions = async (event, context) => {
    try {
        const result = await getPendingMotions();
        return httpResponses.success(result);
    } catch (error) {
        return httpResponses.error(error);
    }
};

module.exports.getWordCloud = async (event, context) => {
    const today = moment();
    let fromDate  = today.format("YYYY-MM-DD"); // defaults to today
    let toDate = today.subtract(1, "month").format("YYYY-MM-DD"); // defaults to last month

    if (event && event.queryStringParameters) {
        fromDate = event.queryStringParameters.fromDate || fromDate;
        toDate = event.queryStringParameters.toDate || toDate;
    }

    try {
        const result = await getWordCloud(fromDate, toDate);
        return httpResponses.success(result);
    } catch (error) {
        return httpResponses.error(error);
    }
};

module.exports.getAllParties = async (event, context) => {
    try {
        const result = await getAllParties();
        return httpResponses.success(result);
    } catch (error) {
        return httpResponses.error(error);
    }
};
