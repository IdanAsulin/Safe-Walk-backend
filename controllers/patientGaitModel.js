const Joi = require('joi');
const patientGaitModelDao = require('../dao/patientGaitModel');
const testDao = require('../dao/test');
const logger = require('../logger');

class PatientGaitModel {
    async createModel(req, res) {
        const rawDataJoi = Joi.array().items({
            x: Joi.number().required(),
            y: Joi.number().required(),
            z: Joi.number().required(),
        }).min(1).required();
        const schema = Joi.object({
            testID: Joi.string().required(),
            sensor1RawData: rawDataJoi,
            sensor2RawData: rawDataJoi,
            sensor3RawData: rawDataJoi,
            sensor4RawData: rawDataJoi,
            sensor5RawData: rawDataJoi,
            sensor6RawData: rawDataJoi,
            sensor7RawData: rawDataJoi
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        try {
            const { testID, sensor1RawData, sensor2RawData, sensor3RawData, sensor4RawData, sensor5RawData, sensor6RawData, sensor7RawData } = value;
            const model = await patientGaitModelDao.findOne({ testID: testID });
            if (model) {
                logger.warn(`testID ${testID} already updated with gait model`);
                return res.status(404).json({
                    message: "testID already updated with gait model"
                });
            }
            const test = await testDao.findOne({ id: testID });
            if (!test) {
                logger.warn(`testID ${testID} to be updated with the new model not found`);
                return res.status(404).json({
                    message: "The test you are trying to update with the new model is not exist"
                });
            }
            const newPatientGatModel = new patientGaitModelDao({ testID, sensor1RawData, sensor2RawData, sensor3RawData, sensor4RawData, sensor5RawData, sensor6RawData, sensor7RawData });
            const response = await newPatientGatModel.save();
            logger.info(`Patient gait model ${response.id} created successfully`);
            return res.status(201).json(response);
        }
        catch (err) {
            logger.error(`Error while trying to create new patient gait model: ${err.message}`);
            return res.status(500).json({
                message: "internal server error"
            });
        }
    }

    async getModelByTestID(req, res) {
        try {
            const response = await patientGaitModelDao.findOne({ testID: req.params.testID });
            if (!response) {
                logger.warn(`Model not found`);
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            logger.info(`Returns model details of test ${req.params.testID}`);
            return res.status(200).json(response);
        } catch (err) {
            logger.error(`Error while trying to get gait model by test ID ${req.params.testID}: ${err.message}`);
            return res.status(500).json({
                message: "internal server error"
            });
        }
    }
}

module.exports = PatientGaitModel;
