const Joi = require('joi');
const bcrypt = require('bcryptjs');
const redis = require('../redisConnection');
const patientDao = require('../dao/patient');
const sensorsKitDao = require('../dao/sensorsKit');
const planDao = require('../dao/plan');
const logger = require('../logger');
const config = require('../config.json');
const { getFromRedis } = require('../utils');

class Patient {
    createPatient = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            mail: Joi.string().email().required(),
            password: Joi.string().min(6).max(13).required(),
            picture: Joi.string().uri().required(),
            phoneNumber: Joi.string().min(10).required(),
            age: Joi.number().min(0).max(120).required(),
            gender: Joi.string().valid('male', 'female').required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        let { name, mail, password, picture, phoneNumber, age, gender } = value;
        try {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
            const newSensorsKit = new sensorsKitDao();
            const sensorKit = await newSensorsKit.save();
            const sensorsKitID = sensorKit.id;
            redis.setex(`sensorsKit_${sensorsKitID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(sensorKit));
            redis.del(`all_sensorsKit`);
            const newPatient = new patientDao({ name, mail, password, picture, phoneNumber, age, gender, sensorsKitID });
            let response = await patientDao.findOne({ mail });
            if (response) {
                logger.warn(`Patient with email address: ${mail} already exists`);
                return res.status(409).json({
                    message: `Patient already exists`
                });
            }
            response = await getFromRedis(`sensorsKit_${sensorsKitID}`);
            if (!response.found) {
                response = await sensorsKitDao.findOne({ id: sensorsKitID });
                redis.setex(`sensorsKit_${sensorsKitID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            }
            else response = response.data;
            if (!response) {
                logger.warn(`The sensors kit ${sensorsKitID} the user tried to update is not exist`);
                return res.status(400).json({
                    message: `The sensors kit you are trying to update is not exist`
                });
            }
            response = await newPatient.save();
            redis.setex(`patient_${response.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_patients`);
            logger.info(`A new patient was created successfully -- patientID: ${response.id}`);
            return res.status(201).json(response);
        } catch (ex) {
            logger.error(`Error while trying to create new patient: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    editPatient = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string(),
            picture: Joi.string().uri(),
            phoneNumber: Joi.string().min(10).max(13),
            age: Joi.number().min(0).max(120),
            gender: Joi.string().valid('male', 'female'),
            sensorsKitID: Joi.string(),
            waitForPlan: Joi.boolean(),
            rehabPlanID: Joi.string()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        let { name, picture, phoneNumber, age, gender, sensorsKitID, waitForPlan, rehabPlanID } = value;
        if (!name && !picture && !phoneNumber && !age && !gender && !sensorsKitID && waitForPlan !== true && waitForPlan !== false && !rehabPlanID) {
            logger.warn(`User did not provide any parameter to update`);
            return res.status(400).json({
                message: `You must provide at least one parameter to update`
            });
        }
        try {
            const patientDocument = await patientDao.findOne({ id: req.params.id });
            redis.setex(`patient_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(patientDocument));
            if (!patientDocument) {
                logger.warn(`Patient ${req.params.id} was not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            if (name) patientDocument.name = name;
            if (picture) patientDocument.picture = picture;
            if (phoneNumber) patientDocument.phoneNumber = phoneNumber;
            if (age) patientDocument.age = age;
            if (gender) patientDocument.gender = gender;
            if (sensorsKitID) {
                let sensorsKit = await getFromRedis(`sensorsKit_${sensorsKitID}`);
                if (!sensorsKit.found) {
                    sensorsKit = await sensorsKitDao.findOne({ id: sensorsKitID });
                    redis.setex(`sensorsKit_${sensorsKitID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(sensorsKit));
                }
                else sensorsKit = sensorsKit.data;
                const kitTaken = await patientDao.find({ sensorsKitID });
                if (!sensorsKit) {
                    logger.warn(`Sensor kit ${sensorsKitID} was not found`);
                    return res.status(400).json({
                        message: `The sensors kit you are trying to update is not exist`
                    });
                }
                if (kitTaken.length > 0) {
                    logger.warn(`Sensor kit ${sensorsKitID} already in use`);
                    return res.status(400).json({
                        message: `The sensors kit you are trying to update is already in use`
                    });
                }
                patientDocument.sensorsKitID = sensorsKitID;
            }
            if (waitForPlan) patientDocument.waitForPlan = waitForPlan;
            if (rehabPlanID) {
                let rehabPlan = await getFromRedis(`rehabPlan_${rehabPlanID}`);
                if (!rehabPlan.found) {
                    rehabPlan = await planDao.findOne({ id: rehabPlanID, type: 'rehabPlan' });
                    redis.setex(`rehabPlan_${rehabPlanID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(rehabPlan));
                }
                else rehabPlan = rehabPlan.data;
                const planTaken = await patientDao.find({ rehabPlanID: rehabPlanID });
                if (!rehabPlan) {
                    logger.warn(`Rehab plan ${rehabPlan} is not exist`);
                    return res.status(400).json({
                        message: `The rehabilitation plan you are trying to update is not exist`
                    });
                }
                if (planTaken.length > 0) {
                    logger.warn(`Rehab plan ${rehabPlan} is already in use`);
                    return res.status(400).json({
                        message: `The plan you are trying to update is already in use`
                    });
                }
                patientDocument.rehabPlanID = rehabPlanID;
            }
            const response = await patientDocument.save();
            redis.setex(`patient_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_patients`);
            logger.info(`Patient (${req.params.id}) was updated successfully`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to edit patient (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getAllPatients = async (req, res) => {
        try {
            const response = await patientDao.find().select('-_id').select('-__v').select('-password');
            redis.setex('all_patients', config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            logger.info(`All patients returned to the client`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get all patients: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getPatientByID = async (req, res) => {
        try {
            const response = await patientDao.findOne({ id: req.params.id }).select('-_id').select('-__v').select('-password');
            redis.setex(`patient_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            if (!response) {
                logger.warn(`Patient (${req.params.id}) not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            logger.info(`Patien ${req.params.id} returned to the client`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get patient (${req.params.id}): ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = Patient;