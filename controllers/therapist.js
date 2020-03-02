const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require('../redisConnection');
const therapistDao = require('../dao/therapist');
const logger = require('../logger');
const config = require('../config.json');

class Therapist {
    createTherapist = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            mail: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
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
        try {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
            const newTherapist = new therapistDao({ name, mail, password, picture });
            let response = await therapistDao.findOne({ mail });
            if (response) {
                logger.warn(`Therapist with email ${mail} is already exist`);
                return res.status(409).json({
                    message: `Therapist is already exist`
                });
            }
            response = await newTherapist.save();
            redis.setex(`therapist_${response.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_therapists`);
            const payload = {
                user: {
                    id: response.id,
                    type: 'therapist',
                    details: response
                }
            };
            jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.TOKEN_EXPIRES_IN }, (error, token) => {
                if (error) {
                    logger.error(`Error while trying to create new therapist: ${error.message}`);
                    return res.status(500).json({
                        message: `Internal server error`
                    });
                }
                logger.info(`A new therapist was created successfully -- therapistID: ${response.id}`);
                return res.cookie('x-auth-token', token, {
                    expires: new Date(Date.now() + config.TOKEN_EXPIRES_IN),
                    secure: config.HTTPS_ENV,
                    httpOnly: true,
                }).status(201).json({ token });
            });
        } catch (ex) {
            logger.error(`Error while trying to create new therapist: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getAllTherapists = async (req, res) => {
        try {
            const response = await therapistDao.find().select('-_id').select('-__v');
            redis.setex(`all_therapists`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
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
            const response = await therapistDao.findOne({ id: req.params.id }).select('-_id').select('-__v');
            redis.setex(`therapist_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
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