const mongoose = require('mongoose');
const config = require('./config.json');
const model = require('./dao/sensorsKit')

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(config.DB_CONNECTION_URL, options)
    .then(async () => {
        console.log(`Connected to the database`)
        try {
            const obj = new model({
                mail: "cdc",
                password: "DFadf",
                picture: "Fda",
                type: "therapist",

            });
            await obj.save();
        } catch (ex) {
            console.error(ex.message);
        }
    })
    .catch(error => {
        console.error(`An error occured while trying to connect to the database: ${error.message}`);
    });