const Joi = require('joi');
const AWS = require('aws-sdk');
const redis = require('../redisConnection');
const sensorsKitDao = require('../dao/sensorsKit');
const logger = require('../logger');
const config = require('../config.json');

process.env['AWS_ACCESS_KEY_ID'] = config.AWS_ACC_KEY_ID;
process.env['AWS_SECRET_ACCESS_KEY'] = config.AWS_SEC_ACC_KEY;
AWS.config.update({
    region: config.AWS_REGION
});
const lambda = new AWS.Lambda();

class SensorsKit {
    createKit = async (req, res) => {
        try {
            const newSensorsKit = new sensorsKitDao();
            const response = await newSensorsKit.save();
            redis.setex(`sensorsKit_${response.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_sensorsKit`);
            logger.info(`Sensors kit was created succesfully- sensorKitID: ${response.id}`);
            return res.status(201).json(response);
        } catch (err) {
            logger.error(`Error while trying to create new sensors kit: ${err.message}`);
            return res.status(500).json({
                message: err.message
            });
        }
    }

    getAllKits = async (req, res) => {
        try {
            const response = await sensorsKitDao.find().select('-_id').select('-__v');
            redis.setex('all_sensorsKit', config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            logger.info(`All kits returned to the client`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to get all sensor kits: ${err.message}`);
            return res.status(500).json({
                message: err.message
            });
        }
    }

    getKitByID = async (req, res) => {
        try {
            const response = await sensorsKitDao.findOne({ id: req.params.id }).select('-_id').select('-__v');
            redis.setex(`sensorsKit_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            if (!response) {
                logger.warn(`Sensor kit ${req.params.id} not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            logger.info(`Sensor kit ${req.params.id} details returned to the client`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to get sensor kit (${req.params.id}): ${err.message}`);
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
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        try {
            const sensorKitDocument = await sensorsKitDao.findOne({ id: req.params.id });
            redis.setex(`sensorsKit_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(sensorKitDocument));
            if (!sensorKitDocument) {
                logger.warn(`Sensor kit ${req.params.id} not found`);
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            const { sensor, ip } = value;
            sensorKitDocument.IPs[sensor] = ip;
            const response = await sensorKitDocument.save();
            redis.setex(`sensorsKit_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_sensorsKit`);
            logger.info(`IPs updated successfully in kit ${req.params.id}`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to update sensors kit ${req.params.id} with new IP: ${err.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    // TODO::
    analyzeRawData = async (req, res) => {
        const schema = Joi.object({
            rawData: Joi.array().items({
                xA: Joi.number().required(),
                yA: Joi.number().required(),
                zA: Joi.number().required(),
                xG: Joi.number().required(),
                yG: Joi.number().required(),
                zG: Joi.number().required(),
                t: Joi.number().required(),
            }).min(1).required(),
            sensorName: Joi.string().valid('sensor1', 'sensor2', 'sensor3', 'sensor4', 'sensor5', 'sensor6', 'sensor7').required(),
            testID: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { sensorName, rawData, testID } = value;
        try {
            const params = {
                FunctionName: "complementaryFilter",
                InvocationType: "RequestResponse",
                Payload: JSON.stringify({
                    SAMPLE_RATE_HZ: config.SAMPLE_RATE_HZ,
                    HIGH_PASS_FILTER: config.HIGH_PASS_FILTER,
                    LOW_PASS_FILTER: config.LOW_PASS_FILTER,
                    rawData: rawData,
                    testID: testID,
                    sensorName: sensorName,
                })
            };
            const response = await lambda.invoke(params).promise();
            return res.status(200).json({ response: response.Payload });
        } catch (ex) {
            logger.error(`Error while trying to analyze raw data: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    complementaryFilter = rawData => {
        const timeDifference = 1 / config.SAMPLE_RATE_HZ;
        const hpf = config.HIGH_PASS_FILTER;
        const lpf = config.LOW_PASS_FILTER;
        const degreesToRadians = Math.PI / 180;
        const radiansToDegrees = 180 / Math.PI;
        let angle = 0;
        const anglesArray = [];
        for (let raw of rawData) {
            const accAngle = Math.atan2(raw.xA, Math.sqrt((raw.yA * raw.yA) + (raw.zA * raw.zA)));
            const gyr_y = raw.yG * degreesToRadians;
            const gyroAngle = angle + (gyr_y * timeDifference);
            angle = ((hpf * gyroAngle) + (lpf * accAngle)) * radiansToDegrees;
            anglesArray.push({ x: raw.t, value: angle });
        }
        return anglesArray;
    }
}

module.exports = SensorsKit;