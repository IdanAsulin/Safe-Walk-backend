const mongoose = require('mongoose');
const config = require('./config.json');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(config.DB_CONNECTION_URL, options)
    .then(() => console.log(`Connected to the database`))
    .catch(error => {
        console.error(`An error occured while trying to connect to the database: ${error.message}`);
    });