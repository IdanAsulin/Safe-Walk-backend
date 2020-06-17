const Joi = require('joi');
const notificationDao = require('../dao/notification');
const logger = require('../logger');
const config = require('../config.json');

class Notification {
    getLastTwoWeeks = async (req, res) => {
        try {
            const schema = Joi.object({
                since: Joi.number().min(1).required()
            });
            const { error, value } = schema.validate(req.query);
            if (error) {
                logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
                return res.status(400).json({
                    message: error.details[0].message
                });
            }
            const { since } = value;
            const now = new Date();
            const sinceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - since);
            const response = await notificationDao.find({ timeStamp: { $gte: sinceDate } }).select('-_id').select('-__v');
            logger.info(`Returns notification of the last day`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get last day notifications: ${ex.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }
}

module.exports = Notification;