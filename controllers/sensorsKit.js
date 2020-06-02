const Joi = require('joi');
const AWS = require('aws-sdk');
const redis = require('../redisConnection');
const sensorsKitDao = require('../dao/sensorsKit');
const patientDao = require('../dao/patient');
const testDao = require('../dao/test');
const logger = require('../logger');
const config = require('../config.json');

process.env['AWS_ACCESS_KEY_ID'] = config.AWS_ACC_KEY_ID;
process.env['AWS_SECRET_ACCESS_KEY'] = config.AWS_SEC_ACC_KEY;
AWS.config.update({
    region: config.AWS_REGION
});
const lambda = new AWS.Lambda();

class SensorsKit {
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
                FunctionName: "GaitCycleDetectionAndCalculations",
                InvocationType: "RequestResponse",
                Payload: JSON.stringify({
                    CALIBRATION_LENGTH: config.CALIBRATION_LENGTH,
                    SAMPLE_TIME: config.SAMPLE_TIME,
                    MIN_GAIT_CYCLES: config.MIN_GAIT_CYCLES,
                    TEST_ID: testID,
                    SENSOR_NAME: sensorName,
                    RAW_DATA: rawData,
                    STD_DEVIATIONS_FACTOR: config.STD_DEVIATIONS_FACTOR,
                    GRAPHS_SIMILARITY_TRESHOLD: config.GRAPHS_SIMILARITY_TRESHOLD,
                    PEAKS_FILTER_TRESHOLD: config.PEAKS_FILTER_TRESHOLD
                })
            };
            /* Detect the best gait cycle, makes calculations of accelerations, velocities and displacements and makes a decision if there is a gait cycle deviation, lambda is also stores the relvant data in the DB  */
            const { Payload } = await lambda.invoke(params).promise();
            const response = JSON.parse(Payload);
            if (response.statusCode === 400) {
                logger.warn(`The raw data contains less than ${config.MIN_GAIT_CYCLES} gait cycles`);
                return res.status(400).json({
                    message: `You have to sample at least ${config.MIN_GAIT_CYCLES} gait cycles`
                });
            }
            if (response.statusCode !== 200) {
                logger.warn(`Error inside Lambda function: ${response.message}`);
                return res.status(500).json({
                    message: `Internal server error`
                });
            }
            return res.status(200).json({ failureObserved: response.failureObserved });
        } catch (ex) {
            logger.error(`Error while trying to analyze raw data: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = SensorsKit;