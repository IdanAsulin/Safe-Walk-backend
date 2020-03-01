const mongoose = require('mongoose');
const config = require('./config.json');
const logger = require('./logger');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(config.DB_CONNECTION_URL, options)
    .then(() => logger.info(`Connected to the database`))
    .catch(error => logger.error(`An error occured while trying to connect to the database: ${error.message}`));