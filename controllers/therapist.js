const Joi = require('joi');
const crypto = require('crypto');
const therapistDao = require('../dao/therapist');
const logger = require('../logger');

class Therapist {
    createTherapist = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            mail: Joi.string().email().required(),
            password: Joi.string().min(6).max(13).required(),
            picture: Joi.string().uri().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        let { name, mail, password, picture } = value;
        password = crypto.createHash('sha256').update(password).digest('base64');
        const newTherapist = new therapistDao({ name, mail, password, picture });
        try {
            let response = await therapistDao.findOne({ mail: mail });
            if (response) {
                logger.warn(`Therapist with email ${mail} is already exist`);
                return res.status(409).json({
                    message: `Therapist is already exist`
                });
            }
            response = await newTherapist.save();
            logger.info(`A new therapist was created successfully -- therapistID: ${response.id}`);
            return res.status(201).json(response);
        } catch (ex) {
            logger.error(`Error while trying to create new therapist: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getAllTherapists = async (req, res) => {
        try {
            const response = await therapistDao.find();
            if (response.length === 0) {
                logger.warn(`No therapists to return`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            logger.info(`All therapists were returned to client`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get all therapists: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getTherapistByID = async (req, res) => {
        try {
            const response = await therapistDao.findOne({ id: req.params.id });
            if (!response) {
                logger.warn(`Therapist ${req.params.id} was not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            logger.info(`Therapist ${req.params.id} details returned to client`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get therapist (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = Therapist;