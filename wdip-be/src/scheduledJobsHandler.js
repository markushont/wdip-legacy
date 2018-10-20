'use strict';

const fetchMotions = require('./scheduledJobs/fetchMotions');
const refreshPendingMotions = require('./scheduledJobs/refreshPendingMotions');

module.exports.fetchMotions = (event, context, callback) => {
  let payload = event.body != undefined ? JSON.parse(event.body) : undefined;

  var from = payload && payload.from != undefined ? payload.from : null;
  var to = payload && payload.to != undefined ? payload.to : null;
  fetchMotions(from, to, callback);
};

module.exports.refreshPendingMotions = (event, context, callback) => {
  refreshPendingMotions(callback);
}