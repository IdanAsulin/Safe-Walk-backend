const patientDao = require('../dao/patient');
const Joi = require('joi');
const crypto = require('crypto');

class Patient {
    async createPatient(req, res) {
        const schema = Joi.object({
            name: Joi.string().required(),
            mail: Joi.string().email().required(),
            password: Joi.string().min(6).max(13).required(),
            picture: Joi.string().uri().required(),
            phoneNumber: Joi.string().min(10).max(13).required(),
            birthDate: Joi.date().required(),
            gender: Joi.string().valid('male', 'female').required(),
            sensorsKitID: Joi.string().required(),
            therapistID: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.message
            });
        let validatedInput = value;
        const hashedPassword = crypto.createHash('sha256').update(validatedInput.password).digest('base64');
        validatedInput['password'] = hashedPassword;
        const newPatient = new patientDao(validatedInput);
        try {
            let response = await patientDao.findOne({ mail: validatedInput.mail });
            if (response)
                return res.status(409).json({
                    message: `Patient is already exist`
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

    async editPatient(req, res) {
        const schema = Joi.object({
            name: Joi.string(),
            password: Joi.string().min(6).max(13),
            picture: Joi.string().uri(),
            phoneNumber: Joi.string().min(10).max(13),
            birthDate: Joi.date(),
            gender: Joi.string().valid('male', 'female'),
            sensorsKitID: Joi.string(),
            therapistID: Joi.string(),
            waitForPlan: Joi.boolean(),
            rehabPlanID: Joi.string()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.message
            });
        if (!req.params.id)
            return res.status(400).json({
                message: `PatientID query parameter is required`
            });
        let validatedInput = value;
        if (validatedInput.password) {
            const hashedPassword = crypto.createHash('sha256').update(validatedInput.password).digest('base64');
            validatedInput['password'] = hashedPassword;
        }
        try {
            const patientDocument = await patientDao.findOne({ id: req.params.id });
            if (!patientDocument)
                return res.status(404).json({
                    message: `Patient not found`
                });
            if (validatedInput.name)
                patientDocument.name = validatedInput.name;
            if (validatedInput.password)
                patientDocument.password = validatedInput.password;
            if (validatedInput.picture)
                patientDocument.picture = validatedInput.picture;
            if (validatedInput.phoneNumber)
                patientDocument.phoneNumber = validatedInput.phoneNumber;
            if (validatedInput.birthDate)
                patientDocument.birthDate = validatedInput.birthDate;
            if (validatedInput.gender)
                patientDocument.gender = validatedInput.gender;
            if (validatedInput.sensorsKitID)
                patientDocument.sensorsKitID = validatedInput.sensorsKitID;
            if (validatedInput.therapistID)
                patientDocument.therapistID = validatedInput.therapistID;
            if (validatedInput.waitForPlan)
                patientDocument.waitForPlan = validatedInput.waitForPlan;
            if (validatedInput.rehabPlanID)
                patientDocument.rehabPlanID = validatedInput.rehabPlanID;
            const response = await patientDocument.save();
            console.log(`Patient (${req.params.id}) was updated successfully`);
            return res.status(200).json({
                patient: response
            });
        } catch (ex) {
            console.error(`Error while trying to edit patient (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    async getAllPatients(req, res) {
        try {
            const response = await patientDao.find();
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to get all patients: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    async getPatientByID(req, res) {
        if (!req.params.id)
            return res.status(500).json({
                message: `Patient ID query parameter is required`
            });
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

    async addTest(req, res) {
        if (!req.params.id)
            return res.status(400).json({
                message: `Patiend ID query parameter is required`
            });
        const schema = Joi.object({
            testID: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.message
            });
        const validatedInput = value;
        try {
            const patientDocument = await patientDao.findOne({ id: req.params.id });
            if (!patientDocument)
                return res.status(404).json({
                    message: `Patient not found`
                });
            if (patientDocument.testsList.indexOf(validatedInput.testID) !== -1)
                return res.status(400).json({
                    message: `Test already exist`
                });
            patientDocument.testsList = [...patientDocument.testsList, validatedInput.testID];
            const response = await patientDocument.save();
            console.log(`Patient (${req.params.id}) was updated with new test (${validatedInput.testID})`);
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to add new test (${validatedInput.testID}) to patient (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = Patient;