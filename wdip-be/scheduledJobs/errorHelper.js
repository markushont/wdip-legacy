"use strict";

class ErrorHelper {
    constructor() {
        this.errors = [];
    }

    logError(errorText) {
        console.error(errorText);
        this.errors.push(errorText);
    }

    getLoggedErrors() {
        return this.errors.length ? this.errors : undefined;
    }
}

var errorHelper = new ErrorHelper();

module.exports = errorHelper;