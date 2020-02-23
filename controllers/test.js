const Joi = require('joi');
const testDao = require('../dao/test');
const patientDao = require('../dao/patient');
const logger = require('../logger');

class Test {
    createTest = async (req, res) => {
        const schema = Joi.object({
            patientID: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { patientID } = value;
        const newTest = new testDao({ patientID });
        try {
            const patient = await patientDao.findOne({ id: patientID });
            if (!patient) {
                logger.warn(`Patient ${patientID} wa not found`);
                return res.status(400).json({
                    message: `Patient is not exist`
                });
            }
            const response = await newTest.save();
            logger.info(`Test was created succesfully - videoID: ${response.id}`);
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
            const response = await testDao.find();
            if (response.length === 0) {
                logger.warn(`No tests to return`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
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
            const response = await testDao.findOne({ id: req.params.id });
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
            let response = await patientDao.findOne({ id: req.params.patientID });
            if (!response) {
                logger.warn(`Patient ${req.params.patientID} is not exist`);
                return res.status(400).json({
                    message: "The patient yoו have sent is not exist"
                });
            }
            response = await testDao.find({ patientID: req.params.patientID });
            if (response.length === 0) {
                logger.warn(`Patient ${req.params.patientID} has no tests`);
                return res.status(404).json({
                    message: "Not found"
                });
            }
            logger.info(`Patient ${req.params.patientID} tests returned to client`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to get all tests for patient - ${req.params.patientID}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    editTest = async (req, res) => {
        if (!req.body.abnormality && !req.body.detailedDiagnostic) {
            logger.warn(`User was not provide any parameter to update`);
            return res.status(400).json({
                message: `You must provide at least abnormality or detailedDiagnostic`
            });
        }
        const schema = Joi.object({
            abnormality: Joi.bool().optional(),
            detailedDiagnostic: Joi.string().optional()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { abnormality, detailedDiagnostic } = value;
        try {
            let testDocument = await testDao.findOne({ id: req.params.id });
            if (!testDocument) {
                logger.warn(`Test ${req.params.id} was not found`);
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            if (abnormality)
                testDocument.abnormality = abnormality;
            if (detailedDiagnostic)
                testDocument.detailedDiagnostic = detailedDiagnostic;
            const response = await testDocument.save();
            logger.info(`Test (${req.params.id}) was updated successfully`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to edit test - ${req.params.id}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }
}

module.exports = Test;