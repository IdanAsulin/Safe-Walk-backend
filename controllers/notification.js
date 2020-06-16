const notificationDao = require('../dao/notification');
const logger = require('../logger');
const config = require('../config.json');

class Notification {
    getLastDay = async (req, res) => {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const response = await notificationDao.find({ timeStamp: { $gte: today } }).select('-_id').select('-__v');
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