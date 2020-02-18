const Joi = require('joi');
const crypto = require('crypto');
const patientDao = require('../dao/patient');
const sensorsKitDao = require('../dao/sensorsKit');
const planDao = require('../dao/plan');
const testDao = require('../dao/test');

class Patient {
    createPatient = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            mail: Joi.string().email().required(),
            password: Joi.string().min(6).max(13).required(),
            picture: Joi.string().uri().required(),
            phoneNumber: Joi.string().min(10).max(13).required(),
            age: Joi.number().min(0).max(120).required(),
            gender: Joi.string().valid('male', 'female').required(),
            sensorsKitID: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        let { name, mail, password, picture, phoneNumber, age, gender, sensorsKitID } = value;
        const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');
        password = hashedPassword;
        const newPatient = new patientDao({ name, mail, password, picture, phoneNumber, age, gender, sensorsKitID });
        try {
            let response = await patientDao.findOne({ mail: mail });
            if (response)
                return res.status(409).json({
                    message: `Patient already exists`
                });
            response = await sensorsKitDao.findOne({ id: sensorsKitID });
            if (!response)
                return res.status(400).json({
                    message: `The sensors kit you are trying to update is not exist`
                });
            response = await newPatient.save();
            console.log(`A new patient was created successfully -- patientID: ${response.id}`);
            return res.status(201).json(response);
        } catch (ex) {
            console.error(`Error while trying to create new patient: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    editPatient = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string(),
            password: Joi.string().min(6).max(13),
            picture: Joi.string().uri(),
            phoneNumber: Joi.string().min(10).max(13),
            age: Joi.number().min(0).max(120),
            gender: Joi.string().valid('male', 'female'),
            sensorsKitID: Joi.string(),
            waitForPlan: Joi.boolean(),
            rehabPlanID: Joi.string()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        let { name, password, picture, phoneNumber, age, gender, sensorsKitID, waitForPlan, rehabPlanID } = value;
        if (!name && !password && !picture && !phoneNumber && !age && !gender && !sensorsKitID && !waitForPlan && !rehabPlanID)
            return res.status(400).json({
                message: `You must provide at least one parameter to update`
            });
        if (password) {
            const hashedPassword = crypto.createHash('sha256').update(password).digest('base64');
            password = hashedPassword;
        }
        try {
            const patientDocument = await patientDao.findOne({ id: req.params.id });
            if (!patientDocument)
                return res.status(404).json({
                    message: `Not found`
                });
            if (name) patientDocument.name = name;
            if (password) patientDocument.password = password;
            if (picture) patientDocument.picture = picture;
            if (phoneNumber) patientDocument.phoneNumber = phoneNumber;
            if (age) patientDocument.age = age;
            if (gender) patientDocument.gender = gender;
            if (sensorsKitID) {
                const sensorsKit = await sensorsKitDao.findOne({ id: sensorsKitID });
                const kitTaken = await patientDao.find({ sensorsKitID: sensorsKitID });
                if (!sensorsKit)
                    return res.status(400).json({
                        message: `The sensors kit you are trying to update is not exist`
                    });
                if (kitTaken.length > 0)
                    return res.status(400).json({
                        message: `The sensors kit you are trying to update is already taken`
                    });
                patientDocument.sensorsKitID = sensorsKitID;
            }
            if (waitForPlan) patientDocument.waitForPlan = waitForPlan;
            if (rehabPlanID) {
                const rehabPlan = await planDao.findOne({ id: rehabPlanID, type: 'rehabPlan' });
                const planTaken = await patientDao.find({ rehabPlanID: rehabPlanID });
                if (!rehabPlan)
                    return res.status(400).json({
                        message: `The rehabilitation plan you are trying to update is not exist`
                    });
                if (planTaken.length > 0)
                    return res.status(400).json({
                        message: `The plan you are trying to update is already taken`
                    });
                patientDocument.rehabPlanID = rehabPlanID;
            }
            const response = await patientDocument.save();
            console.log(`Patient (${req.params.id}) was updated successfully`);
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to edit patient (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getAllPatients = async (req, res) => {
        try {
            const response = await patientDao.find();
            if (response.length === 0)
                return res.status(404).json({
                    message: `Not found`
                });
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to get all patients: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getPatientByID = async (req, res) => {
        try {
            const response = await patientDao.findOne({ id: req.params.id });
            if (!response)
                return res.status(404).json({
                    message: `Not found`
                });
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to get patient (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    addTest = async (req, res) => {
        const schema = Joi.object({
            testID: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { testID } = value;
        try {
            const patientDocument = await patientDao.findOne({ id: req.params.id });
            if (!patientDocument)
                return res.status(404).json({
                    message: `Not found`
                });
            const testToAdd = await testDao.findOne({ id: testID });
            if (!testToAdd)
                return res.status(400).json({
                    message: `Test is not exist`
                });
            if (patientDocument.testsList.indexOf(testID) !== -1)
                return res.status(400).json({
                    message: `Test already exist in the patient's tests history`
                });
            patientDocument.testsList = [...patientDocument.testsList, testID];
            const response = await patientDocument.save();
            console.log(`Patient (${req.params.id}) was updated with new test (${testID})`);
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to add new test (${testID}) to patient (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = Patient;