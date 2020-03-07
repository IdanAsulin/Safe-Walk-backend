const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const therapistDao = require('../dao/therapist');
const patientDao = require('../dao/patient');
const logger = require('../logger');

class Auth {
    login = async (req, res) => {
        const schema = Joi.object({
            mail: Joi.string().email().required(),
            password: Joi.string().min(6).max(13).required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { mail, password } = value;
        try {
            let userType;
            let user = await therapistDao.findOne({ mail: mail });
            if (!user) {
                user = await patientDao.findOne({ mail: mail });
                if (!user) {
                    logger.warn(`User was trying to login with mail which is not exist: ${mail}`);
                    return res.status(401).json({
                        message: `Invalid credentials`
                    });
                }
                else userType = 'patient';
            }
            else userType = 'therapist';
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                logger.warn(`User was trying to login with wrong password: ${mail}, ${password}`);
                return res.status(401).json({
                    message: `Invalid credentials`
                });
            }
            const payload = {
                user: {
                    id: user.id,
                    type: userType,
                    details: user
                }
            };
            jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.TOKEN_EXPIRES_IN }, (error, token) => {
                if (error) {
                    logger.error(`Error while trying to create new therapist: ${error.message}`);
                    return res.status(500).json({
                        message: `Internal server error`
                    });
                }
                logger.info(`User ${mail} was logged in`);
                return res.status(200).json({ token });
            })
        } catch (ex) {
            logger.error(`Error while trying to login (${mail}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = Auth;