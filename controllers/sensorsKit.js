const Joi = require('joi');
const sensorsKitDao = require('../dao/sensorsKit');

class SensorsKit {
    createKit = async (req, res) => {
        try {
            const newSensorsKit = new sensorsKitDao();
            const response = await newSensorsKit.save();
            console.log(`Sensors kit was created succesfully- sensorKitID: ${response.id}`);
            return res.status(201).json(response);
        } catch (err) {
            console.error(`Error while trying to create new sensors kit: ${err.message}`);
            return res.status(500).json({
                message: err.message
            });
        }
    }

    getAllKits = async (req, res) => {
        try {
            const response = await sensorsKitDao.find();
            if (response.length === 0)
                return res.status(404).json({
                    message: 'Not found'
                });
            return res.status(200).json(response);
        } catch (err) {
            console.error(`Error while trying to get all sensor kits: ${err.message}`);
            return res.status(500).json({
                message: err.message
            });
        }
    }

    getKitByID = async (req, res) => {
        try {
            const response = await sensorsKitDao.findOne({ id: req.params.id });
            if (!response) {
                return res.status(404).json({
                    message: `Not found`
                });
            }
            return res.status(200).json(response);
        } catch (err) {
            console.error(`Error while trying to get sensor kit (${req.params.id}): ${err.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    updateIPs = async (req, res) => {
        const schema = Joi.object({
            sensor: Joi.string().valid('sensor1', 'sensor2', 'sensor3', 'sensor4', 'sensor5', 'sensor6', 'sensor7').required(),
            ip: Joi.string().ip().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        try {
            const sensorKitDocument = await sensorsKitDao.findOne({ id: req.params.id });
            if (!sensorKitDocument)
                return res.status(404).json({
                    message: 'Not found'
                });
            const { sensor, ip } = value;
            sensorKitDocument.IPs[sensor] = ip;
            const response = await sensorKitDocument.save();
            return res.status(200).json(response);
        } catch (err) {
            console.error(`Error while trying to update ${sensor} of kit ${req.params.id} with new IP: ${err.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    // TODO:: will be continued
    start = async (req, res) => {
        // send to each sensor, command to start scan for x seconds

        // getting the sensors output

        // clean noises -- send to lambda

        // normalize data -- send to lambda

        // gets the relevant patient

        // creates new test in the database

        // store in database - patientGaitModel collection

        // comparing against normal walking model -- send to lambda

        // store diagnostic in database - patient collection

        // returning results to client
    }
}

module.exports = SensorsKit;