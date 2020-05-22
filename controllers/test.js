const Joi = require('joi');
const redis = require('../redisConnection');
const testDao = require('../dao/test');
const patientDao = require('../dao/patient');
const modelDao = require('../dao/patientGaitModel');
const logger = require('../logger');
const config = require('../config.json');
const { getFromRedis } = require('../utils');

class Test {
    createTest = async (req, res) => {
        const patientID = req.user.id;
        const newTest = new testDao({ patientID: patientID });
        try {
            let patient = await getFromRedis(`patient_${patientID}`);
            if (!patient.found) {
                patient = await patientDao.findOne({ id: patientID });
                redis.setex(`patient_${patientID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(patient));
            }
            else patient = patient.data;
            if (!patient) {
                logger.warn(`Patient ${patientID} wa not found`);
                return res.status(400).json({
                    message: `Patient is not exist`
                });
            }
            const response = await newTest.save();
            const newModel = new modelDao({ testID: response.id });
            await newModel.save();
            redis.setex(`test_${response.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(patient));
            redis.del(`all_tests`);
            logger.info(`Test was created succesfully - testID: ${response.id}`);
            return res.status(201).json(response);
        } catch (err) {
            logger.error(`Error while trying to create new test: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getAllTests = async (req, res) => {
        try {
            const response = await testDao.find().select('-_id').select('-__v');
            redis.setex(`all_tests`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            logger.info(`All tests returned to the client`);
            return res.status(200).json(response);
        } catch (err) {
            logger.log(`Error while trying to get all tests: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getTestByID = async (req, res) => {
        try {
            const response = await testDao.findOne({ id: req.params.id }).select('-_id').select('-__v');
            redis.setex(`test_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            if (!response) {
                logger.warn(`Test ${req.params.id} was not found`);
                return res.status(404).json({
                    message: "Not found"
                });
            }
            logger.info(`Test ${req.params.id} details returned to client`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to get test - ${req.params.id}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getTestsByPatientID = async (req, res) => {
        try {
            let response = await getFromRedis(`patient_${req.params.patientID}`);
            if (!response.found) {
                response = await patientDao.findOne({ id: req.params.patientID }).select('-_id').select('-__v');
                redis.setex(`patient_${req.params.patientID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            }
            else response = response.data;
            if (!response) {
                logger.warn(`Patient ${req.params.patientID} is not exist`);
                return res.status(404).json({
                    message: "The patient you have sent is not exist"
                });
            }
            response = await testDao.find({ patientID: req.params.patientID }).select('-_id').select('-__v');
            logger.info(`Patient ${req.params.patientID} tests were returned to the client`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to get all tests for patient - ${req.params.patientID}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    editTest = async (req, res) => {
        const schema = Joi.object({
            abnormality: Joi.bool().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { abnormality } = value;
        try {
            let testDocument = await testDao.findOne({ id: req.params.id });
            if (!testDocument) {
                logger.warn(`Test ${req.params.id} was not found`);
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            if (abnormality) {
                testDocument.abnormality = abnormality;
                const patient = await patientDao.findOne({ id: testDocument.patientID });
                patient.waitForPlan = abnormality;
                await patient.save();
                redis.setex(`patient_${testDocument.patientID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(patient));
            }
            const response = await testDocument.save();
            redis.setex(`test_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(testDocument));
            redis.del(`all_tests`);
            logger.info(`Test (${req.params.id}) was updated successfully`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to edit test - ${req.params.id}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    removeTest = async (req, res) => {
        try {
            const response = await testDao.findOneAndRemove({ id: req.params.id });
            redis.del(`test_${req.params.id}`);
            redis.del(`all_tests`);
            logger.info(`Test ${req.params.id} was successfully removed`);
            if (response) return res.status(200).json();
            return res.status(202).json();
        } catch (ex) {
            logger.error(`Error while trying to remove test - ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }
}

module.exports = Test;