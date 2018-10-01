'use strict';

const request = require('request');
var errorHelpers = require('./errorHelper');

const MOTION_QUERY_DYNAMIC = 'http://data.riksdagen.se/dokumentlista/?sok=&doktyp=mot&rm=&from={}&tom={}&ts=&bet=&tempbet=&nr=&org=&iid=&parti=S&parti=M&parti=L&parti=KD&parti=V&parti=SD&parti=C&parti=MP&parti=NYD&parti=-&webbtv=&talare=&exakt=&planering=&sort=datum&sortorder=asc&rapport=&utformat=json&a=s#soktraff';

const PROPOSITION_QUERY_DYNAMIC = 'http://data.riksdagen.se/dokumentlista/?sok=&doktyp=prop&rm=&from={}&tom={}&ts=&bet=&tempbet=&nr=&org=&iid=&webbtv=&talare=&exakt=&planering=&sort=datum&sortorder=asc&rapport=&utformat=json&a=s#soktraff';

const DOC_STATUS_QUERY_DYNAMIC = 'http://data.riksdagen.se/dokumentstatus/{}.json';

String.prototype.format = function () {
  let i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
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

/* Http fetch from URL encoded string */
function getJsonFromUrl(urlString) {
  console.log("Fetching URL: " + urlString);
  return new Promise((resolve, reject) => {
    request(urlString, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject('Invalid status code <' + response.statusCode + '>');
      } else {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          errorHelper.logError('Invalid JSON in response from url ' + urlString);
          reject('Invalid JSON in response from url ' + urlString);
        }
      }
    });
  }, 2000);
}

module.exports = {
  getMotionQuery:      getMotionQuery,
  getPropositionQuery: getPropositionQuery,
  getDocStatusQuery:   getDocStatusQuery,
  getJsonFromUrl:      getJsonFromUrl
}