'use strict';

const getMotionsByParty = require('./api/getMotionsByParty');

/**
 * Base response HTTP headers
 */
const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',        // Required for CORS support to work
    'Access-Control-Allow-Credentials': true   // Required for cookies, authorization headers with HTTPS 
};

/**
 * HTTP response templates
 */
const responses = {
    success: (data = {}, code = 200) => {
        return {
            'statusCode': code,
            'headers': responseHeaders,
            'body': JSON.stringify(data)
        }
    },
    error: (error) => {
        return {
            'statusCode': error.code || 500,
            'headers': responseHeaders,
            'body': JSON.stringify(error)
        }
    }
};

module.exports.getMotionsByParty = async (event, context) => {
    let result = await getMotionsByParty(new Date(2000, 0, 1), new Date(2010, 0, 1));
    return responses.success(result);
};