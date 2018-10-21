"use strict";

const logger = require("../logger");

class ErrorHelper {
    constructor() {
        this.errors = [];
    }

    logError(errorText) {
        logger.error(errorText);
        this.errors.push(errorText);
    }

    getLoggedErrors() {
        return this.errors.length ? this.errors : undefined;
    }
}

var errorHelper = new ErrorHelper();

module.exports = errorHelper;
