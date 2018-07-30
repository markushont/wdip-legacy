'use strict';

const fetchMotions = require('./fetchMotions');

module.exports.fetchMotions = async (event, context, callback) => {
  var from = event.from != undefined ? event.from : null;
  var to = event.to != undefined ? event.to : null;
  const response = await fetchMotions(from, to);
  callback(null, response);
};
