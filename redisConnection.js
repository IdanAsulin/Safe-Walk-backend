const redis = require('redis');
const logger = require('./logger');
const redisPort = 6379;

const client = redis.createClient(redisPort);
client.on('error', error => {
    const errorMessage = `Error while trying to connect to REDIS cache memory: ${error.message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
});

module.exports = client;