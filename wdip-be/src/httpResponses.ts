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
const httpResponses = {
    success: (data = {}, code = 200) => {
        return {
            statusCode: code,
            headers: responseHeaders,
            body: JSON.stringify(data)
        };
    },
    error: (error) => {
        return {
            statusCode: error.code || 500,
            headers: responseHeaders,
            body: JSON.stringify(error)
        };
    }
};

export default httpResponses;
