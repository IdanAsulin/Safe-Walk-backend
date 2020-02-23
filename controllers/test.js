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
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { patientID } = value;
        const newTest = new testDao({ patientID });
        try {
            const patient = await patientDao.findOne({ id: patientID });
            if (!patient)
                return res.status(400).json({
                    message: `Patient is not exist`
                });
            const response = await newTest.save();
            console.log(`Test was created succesfully - videoID: ${response.id}`);
            return res.status(201).json(response);
        } catch (err) {
            console.error(`Error while trying to create new test: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getAllTests = async (req, res) => {
        try {
            const response = await testDao.find();
            if (response.length === 0)
                return res.status(404).json({
                    message: `Not found`
                });
            return res.status(200).json(response);
        } catch (err) {
            console.log(`Error while trying to get all tests: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getTestByID = async (req, res) => {
        try {
            const response = await testDao.findOne({ id: req.params.id });
            if (!response)
                return res.status(404).json({
                    message: "Not found"
                });
            console.log(`Returns test - testID: ${req.params.id}`);
            return res.status(200).json(response);
        } catch (err) {
            console.error(`Error while trying to get test - ${req.params.id}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getTestsByPatientID = async (req, res) => {
        try {
            const response = await testDao.find({ patientID: req.params.patientID });
            if (response.length === 0)
                return res.status(404).json({
                    message: "Not found"
                });
            console.log(`Returns tests for patient: ${req.params.patientID}`);
            return res.status(200).json(response);
        } catch (err) {
            console.error(`Error while trying to get all tests for patient - ${req.params.patientID}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    editTest = async (req, res) => {
        if (!req.body.abnormality && !req.body.detailedDiagnostic)
            return res.status(400).json({
                message: `You must provide at least abnormality or detailedDiagnostic`
            });
        const schema = Joi.object({
            abnormality: Joi.bool().optional(),
            detailedDiagnostic: Joi.string().optional()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { abnormality, detailedDiagnostic } = value;
        try {
            let testDocument = await testDao.findOne({ id: req.params.id });
            if (!testDocument)
                return res.status(404).json({
                    message: 'Not found'
                });
            if (abnormality)
                testDocument.abnormality = abnormality;
            if (detailedDiagnostic)
                testDocument.detailedDiagnostic = detailedDiagnostic;
            const response = await testDocument.save();
            console.log(`Test (${req.params.id}) was updated successfully`);
            return res.status(200).json(response);
        } catch (err) {
            console.error(`Error while trying to edit test - ${req.params.id}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }
}

module.exports = Test;