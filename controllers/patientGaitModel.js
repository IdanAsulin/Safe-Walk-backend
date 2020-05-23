const Joi = require('joi');
const redis = require('../redisConnection');
const patientGaitModelDao = require('../dao/patientGaitModel');
const testDao = require('../dao/test');
const logger = require('../logger');
const config = require('../config.json');
const { getFromRedis } = require('../utils');

class PatientGaitModel {
    async createModel(req, res) {
        const schema = Joi.object({
            testID: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        try {
            const { testID } = value;
            let model = await getFromRedis(`gaitModel_${testID}`);
            if (!model.found) {
                model = await patientGaitModelDao.findOne({ testID });
                redis.setex(`gaitModel_${testID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            }
            else model = model.data;
            if (model) {
                logger.warn(`testID ${testID} already updated with gait model`);
                return res.status(404).json({
                    message: "testID already updated with gait model"
                });
            }
            let test = await getFromRedis(`test_${testID}`);
            if (!test.found) {
                test = await testDao.findOne({ id: testID });
                redis.setex(`test_${testID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            }
            else test = test.data;
            if (!test) {
                logger.warn(`testID ${testID} to be updated with the new model was not found`);
                return res.status(404).json({
                    message: "The test you are trying to update with the new model is not exist"
                });
            }
            const newPatientGatModel = new patientGaitModelDao({ testID });
            const response = await newPatientGatModel.save();
            logger.info(`Patient gait model ${response.id} created successfully`);
            return res.status(201).json(response);
        }
        catch (err) {
            logger.error(`Error while trying to create new patient gait model: ${err.message}`);
            return res.status(500).json({
                message: "internal server error"
            });
        }
    }

    async updateModel(req, res) {
        const rawDataJoi = Joi.array().items({
            timeStamp: Joi.number().required(),
            x: Joi.number().required(),
            y: Joi.number().required(),
            z: Joi.number().required()
        }).min(1);
        const schema = Joi.object({
            sensorName: Joi.string().valid('sensor1', 'sensor2', 'sensor3', 'sensor4', 'sensor5', 'sensor6', 'sensor7').required(),
            accelerations: rawDataJoi,
            velocities: rawDataJoi,
            displacements: rawDataJoi,
            report: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        try {
            const testID = req.params.testID;
            const { sensorName, accelerations, velocities, displacements, report } = value;
            let model = await patientGaitModelDao.findOne({ testID });
            redis.setex(`gaitModel_${testID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(model));
            if (!model) {
                logger.warn(`Model with testID ${testID} was not found`);
                return res.status(404).json({
                    message: "Model Not found"
                });
            }
            let test = await getFromRedis(`test_${testID}`);
            if (!test.found) {
                test = await testDao.findOne({ id: testID });
                redis.setex(`test_${testID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(test));
            }
            else test = test.data;
            if (!test) {
                logger.warn(`testID ${testID} was not found`);
                return res.status(404).json({
                    message: "The test you are trying to update was not found"
                });
            }
            
            model[sensorName].accelerations = accelerations;
            model[sensorName].velocities = velocities;
            model[sensorName].displacements = displacements;
            model[sensorName].report = report;

            const response = await model.save();
            redis.setex(`gaitModel_${testID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            logger.info(`Patient gait model for test ${testID} updated successfully`);
            return res.status(200).json(response);
        }
        catch (err) {
            logger.error(`Error while trying to update patient gait model: ${err.message}`);
            return res.status(500).json({
                message: "internal server error"
            });
        }
    }

    async getModelByTestID(req, res) {
        try {
            let response = await testDao.findOne({ id: req.params.testID });
            redis.setex(`test_${req.params.testID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            if (!response) {
                logger.warn(`Test ${req.params.testID} was not found`);
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            response = await patientGaitModelDao.findOne({ testID: req.params.testID }).select('-_id').select('-__v');
            redis.setex(`gaitModel_${req.params.testID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            if (!response) {
                logger.warn(`Model for test ${req.params.testID} was not found`);
                return res.status(200).json({});
            }
            logger.info(`Returns model details of test ${req.params.testID}`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to get gait model by test ID ${req.params.testID}: ${err.message}`);
            return res.status(500).json({
                message: "internal server error"
            });
        }
    }
}

module.exports = PatientGaitModel;