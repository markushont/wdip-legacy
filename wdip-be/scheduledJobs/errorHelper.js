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

    getLoggedErrorsStr() {
        return this.errors.length ? this.errors.join('\n') : undefined;
    }
}

var errorHelper = new ErrorHelper();

module.exports = errorHelper;