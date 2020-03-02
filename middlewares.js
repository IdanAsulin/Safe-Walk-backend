const jwt = require('jsonwebtoken');
const config = require('./config.json');
const logger = require('./logger');
const { getFromRedis } = require('./utils');

module.exports = {
    validateRequestBody(err, req, res, next) {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
            return res.status(400).json({ message: `Request body is an invalid JSON` });
        next();
    },

    authenticate(req, res, next) {
        const token = req.cookies['x-auth-token'] || '';
        if (!token) {
            logger.warn(`User did not send token`);
            return res.status(401).json({
                message: `Authorization denied`
            });
        }
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            req.user = decoded.user;
            next();
        } catch (ex) {
            logger.warn(`User has sent an invalid token`);
            return res.status(401).json({
                message: `Authorization denied`
            });
        }
    },

    blockNotTherapists(req, res, next) {
        if (req.user.type !== 'therapist') {
            logger.warn(`User ${req.user.id} which is not a therapist was trying to access therapist's endpoint`);
            return res.status(401).json({
                message: `Authorization denied`
            });
        }
        next();
    },

    blockNotPatients(req, res, next) {
        if (req.user.type !== 'patient') {
            logger.warn(`User ${req.user.id} which is not a patient was trying to access patient's endpoint`);
            return res.status(401).json({
                message: `Authorization denied`
            });
        }
        next();
    },

    async checkInCache(req, res, next, id) {
        try {
            const results = await getFromRedis(id);
            if (results.found && results.data) {
                logger.info(`Results for id ${id} were returned to the client from REDIS cache memory`);
                const data = results.data;
                return res.status(200).json(data);
            }
            logger.info(`Results for id ${id} were not found in REDIS cache memory`);
            next();
        } catch (ex) {
            logger.error(ex);
            return next();
        }
    }
};