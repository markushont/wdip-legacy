"use strict";

var request = require("request");
var errorHelper = require("./errorHelper");
const logger = require("../logger");

const MOTION_QUERY_DYNAMIC =
  "http://data.riksdagen.se/dokumentlista/?sok=&doktyp=mot&rm=&from={}&tom={}&ts=&bet=&tempbet=&nr=&org=&iid=" +
  "&parti=S&parti=M&parti=L&parti=KD&parti=V&parti=SD&parti=C&parti=MP&parti=NYD&parti=-&webbtv=&talare=" +
  "&exakt=&planering=&sort=datum&sortorder=asc&rapport=&utformat=json&a=s#soktraff";

const PROPOSITION_QUERY_DYNAMIC =
  "http://data.riksdagen.se/dokumentlista/?sok=&doktyp=prop&rm=&from={}&tom={}&ts=&bet=&tempbet=&nr=&org=&iid=" +
  "&webbtv=&talare=&exakt=&planering=&sort=datum&sortorder=asc&rapport=&utformat=json&a=s#soktraff";

const DOC_STATUS_QUERY_DYNAMIC = "http://data.riksdagen.se/dokumentstatus/{}.json";

const DOC_SUMMARY_QUERY_DYNAMIC = "http://data.riksdagen.se/dokument/{}.text";

String.prototype.format = function() {
  let i = 0;
  let args = arguments;
  return this.replace(/{}/g, () => {
    return typeof args[i] !== "undefined" ? args[i++] : "";
  });
};

function getMotionQuery(fromString, toString) {
  return MOTION_QUERY_DYNAMIC.format(fromString, toString);
}

function getPropositionQuery(fromString, toString) {
  return PROPOSITION_QUERY_DYNAMIC.format(fromString, toString);
}

function getDocStatusQuery(docId) {
  return encodeURI(DOC_STATUS_QUERY_DYNAMIC.format(docId));
}

function getDocSummaryQuery(docId) {
  return encodeURI(DOC_SUMMARY_QUERY_DYNAMIC.format(docId));
}

/* Http fetch from URL encoded string */
function fetchUrl(urlString, parseFunc) {
  logger.debug(`Fetching URL: ${urlString}`);
  return new Promise((resolve, reject) => {
    request(urlString, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject("Invalid status code <" + response.statusCode + ">");
      } else {
        try {
          resolve(parseFunc(body));
        } catch (err) {
          errorHelper.logError(err);
          reject(err);
        }
      }
    });
  });
}

function getJsonFromUrl(urlString) {
  let parseFunc = (resp) => {
    try {
      return JSON.parse(resp);
    } catch (err) {
      throw new Error("Invalid JSON in response from url " + urlString);
    }
  };
  return fetchUrl(urlString, parseFunc);
}

function getPlainTextFromUrl(urlString) {
  let parseFunc = (resp) => { return resp; };
  return fetchUrl(urlString, parseFunc);
}

module.exports = {
  getMotionQuery: getMotionQuery,
  getPropositionQuery: getPropositionQuery,
  getDocStatusQuery: getDocStatusQuery,
  getDocSummaryQuery: getDocSummaryQuery,
  getJsonFromUrl: getJsonFromUrl,
  getPlainTextFromUrl, getPlainTextFromUrl
};
