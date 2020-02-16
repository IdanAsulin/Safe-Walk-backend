const patientGaitModelDao = require('../dao/patientGaitModel');
const Joi = require('joi');

class PatientGaitModel {
    async createModel(req , res) {
        const schema = Joi.object({
            testID: Joi.string().required(),
            kitID: Joi.string().required(),
            sensorsOutput: Joi.array().items(Joi.object({
                sensorLocation: Joi.number().min(1).max(7).required(),
                rawData: Joi.array().items(Joi.object({
                    x: Joi.number().required(),
                    y: Joi.number().required(),
                    z: Joi.number().required()
                }))
            }))
        })

        const {error, value} = schema.validate(req.body)
        if (error) {
            console.error("error :: " . error)
            return res.status(400).json({
                message: error.message
            })
        } else if (value) {
            try {
                const patientGatModelDao = new patientGaitModelDao(value)
                const response = await patientGatModelDao.save()
                return res.status(201).json({
                    patientGaitModel: {
                        id: response.id,
                    }
                })
            }
            catch(err) {
                console.error('error: ' , err)
                return res.status(500).json({
                    message: "internal server error"
                })
            }
        }
    }

    async getModelByID(req, res) {
        if(!req.params.id) {
            return res.status(400).json({
                message: "missing id parameter"
            })
        }
        try {
            const response = await patientGaitModelDao.findOne({id: req.params.id})
            return res.status(200).json(response)
        } catch(err) {
            console.error(err)
            return res.status(500).json({
                message: "internal server error"
            })
        }
    }
}

module.exports = PatientGaitModel
