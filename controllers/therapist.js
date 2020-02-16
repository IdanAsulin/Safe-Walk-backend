const therapistDao = require('../dao/therapist');
const Joi = require('joi');
const crypto = require('crypto');

class Therapist {
    createTherapist = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            mail: Joi.string().email().required(),
            password: Joi.string().min(6).max(13).required(),
            picture: Joi.string().uri().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.message
            });
        let validatedInput = value;
        const hashedPassword = crypto.createHash('sha256').update(validatedInput.password).digest('base64');
        validatedInput['password'] = hashedPassword;
        const newTherapist = new therapistDao(validatedInput);
        try {
            let response = await therapistDao.findOne({ mail: validatedInput.mail });
            if (response)
                return res.status(409).json({
                    message: `Therapist is already exist`
                });
            response = await newTherapist.save();
            console.log(`A new therapist was created successfully -- therapistID: ${response.id}`);
            return res.status(201).json(response);
        } catch (ex) {
            console.error(`Error while trying to create new therapist: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    addPatient = async (req, res) => {
        if (!req.params.id)
            return res.status(400).json({
                message: `Therapist ID query parameter is required`
            });
        const schema = Joi.object({
            patientID: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.message
            });
        const validatedInput = value;
        try {
            const therapistDocument = await therapistDao.findOne({ id: req.params.id });
            if (!therapistDocument)
                return res.status(404).json({
                    message: `Therapist not found`
                });
            if (therapistDocument.patients.indexOf(validatedInput.patientID) !== -1)
                return res.status(400).json({
                    message: `Patient already exist`
                });
            therapistDocument.patients = [...therapistDocument.patients, validatedInput.patientID];
            const response = await therapistDocument.save();
            console.log(`Therapist (${req.params.id}) was updated with new patient (${validatedInput.patientID})`);
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to add new patient (${validatedInput.patientID}) to therapist (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getAllTherapists = async (req, res) => {
        try {
            const response = await therapistDao.find();
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to get all therapists: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getTherapistByID = async (req, res) => {
        if (!req.params.id)
            return res.status(500).json({
                message: `Therapist ID query parameter is required`
            });
        try {
            const response = await therapistDao.findOne({ id: req.params.id });
            if (!response)
                return res.status(404).json({
                    message: `Not found`
                });
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to get therapist (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = Therapist;