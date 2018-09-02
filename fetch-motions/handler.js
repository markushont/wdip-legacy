'use strict';

const fetchMotions = require('./fetchMotions');

module.exports.fetchMotions = (event, context, callback) => {
  console.log("Hello from fetchMotions");
  let payload = event.body != undefined ? JSON.parse(event.body) : undefined;

  var from = payload && payload.from != undefined ? payload.from : null;
  var to = payload && payload.to != undefined ? payload.to : null;
  fetchMotions(from, to, callback);
};
