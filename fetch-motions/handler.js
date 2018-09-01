'use strict';

const fetchMotions = require('./fetchMotions');

module.exports.fetchMotions = async (event, context, callback) => {
  let payload = event.body != undefined ? JSON.parse(event.body) : undefined;

  var from = payload && payload.from != undefined ? payload.from : null;
  var to = payload && payload.to != undefined ? payload.to : null;
  try {
    const response = await fetchMotions(from, to);
    callback(null, response);
  } catch (error) {
    console.log("Error while fetching motions. Error: " + error);
    callback(null, error);
  }
};
