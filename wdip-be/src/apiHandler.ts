"use strict";

import moment, { Moment } from "moment";
import getAllParties from "./api/getAllParties";
import getMotionsByParty from "./api/getMotionsByParty";
import getMotionsForParty from "./api/getMotionsForParty";
import getWordCloud from "./api/getWordCloud";
import { getMotionById, getPendingMotions } from "./api/motions";
import httpResponses from "./httpResponses";

interface DateInterval {
    fromDate: Moment;
    toDate: Moment;
}

function getDateInterval(event: any): DateInterval {
    const today = moment();
    let fromDate  = today; // defaults to today
    let toDate = today.subtract(1, "month"); // defaults to last month

    if (event && event.queryStringParameters) {
        if (event.queryStringParameters.fromDate) {
            fromDate = moment(event.queryStringParameters.fromDate);
        }

        if (event.queryStringParameters.toDate) {
            toDate = moment(event.queryStringParameters.toDate);
        }
    }

    return { fromDate, toDate };
}

module.exports.getMotionsByParty = async (event, context) => {
    const { fromDate, toDate } = getDateInterval(event);
    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    try {
        const result = await getMotionsByParty(fromDateStr, toDateStr);
        return httpResponses.success(result);
    } catch (error) {
        return httpResponses.error(error);
    }
};

module.exports.getMotionsForParty = async (event, context) => {
    const id = decodeURIComponent(event.pathParameters.id);
    const { fromDate, toDate } = getDateInterval(event);
    const fromResultNo = event.queryStringParameters.fromResultNo;

    try {
        const result = await getMotionsForParty(id, fromDate, toDate, fromResultNo);
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
    const { fromDate, toDate } = getDateInterval(event);
    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    try {
        const result = await getWordCloud(fromDateStr, toDateStr);
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
