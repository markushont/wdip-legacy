const config = require('./environment');

Object.keys(config).forEach(key => {
    config[key] = process.env[key] || config[key];
});

module.exports = config;
