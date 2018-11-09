"use strict";

const logger = require("../logger");

class ErrorHelper {
    constructor() {
        this.errors = [];
        this.incompleteDocs = [];
    }

    logError(errorText) {
        logger.error(errorText);
        this.errors.push(errorText);
    }

    logIncomplete(docId) {
        logger.error(`Incomplete document with id ${docId}`);
        this.incompleteDocs.push(docId);
    }

    getLoggedErrors() {
        return this.errors;
    }

    getIncompleteDocs() {
        return this.incompleteDocs;
    }
}

var errorHelper = new ErrorHelper();

module.exports = errorHelper;
