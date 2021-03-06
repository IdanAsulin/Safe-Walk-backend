const Joi = require('joi');
const redis = require('../redisConnection');
const videoDao = require('../dao/video');
const logger = require('../logger');
const config = require('../config.json');

class Video {
    createVideo = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            link: Joi.string().uri().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { name, link } = value;
        const videoToCreate = new videoDao({ name, link });
        try {
            const videoExist = await videoDao.findOne({ link });
            if (videoExist) {
                logger.warn(`Video with link ${link} already exist`);
                return res.status(409).json({
                    message: 'Video already exists'
                });
            }
            const addedVideo = await videoToCreate.save();
            redis.setex(`video_${addedVideo.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(addedVideo));
            redis.del(`all_videos`);
            logger.info(`Video was created succesfully - videoID: ${addedVideo.id}`);
            return res.status(201).json(addedVideo);
        } catch (err) {
            logger.error(`Error while trying to create new video: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    removeVideo = async (req, res) => {
        try {
            const response = await videoDao.findOneAndRemove({ id: req.params.id });
            redis.del(`video_${req.params.id}`);
            redis.del(`all_videos`);
            logger.info(`Video ${req.params.id} was successfully removed`);
            if (response) return res.status(200).json();
            return res.status(202).json();
        } catch (ex) {
            logger.error(`Error while trying to remove video - ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getAllVideos = async (req, res) => {
        try {
            let response;
            if (req.query.videoIDs) {
                const videoIDs = req.query.videoIDs.split(',');
                response = await videoDao.find({ id: { $in: videoIDs } }).select('-_id').select('-__v');
                logger.info(`All video IDs requested by the user were returned`);
            }
            else {
                response = await videoDao.find().select('-_id').select('-__v');
                redis.setex(`all_videos`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
                logger.info(`All videos were returned to client`);
            }
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get all videos: ${ex.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getVideoByID = async (req, res) => {
        try {
            const response = await videoDao.findOne({ id: req.params.id }).select('-_id').select('-__v');
            redis.setex(`video_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            if (!response) {
                logger.warn(`Video ${req.params.id} was not found`);
                return res.status(404).json({
                    message: "Not found"
                });
            }
            logger.info(`Returns video - videoID: ${req.params.id}`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get video - ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    editVideo = async (req, res) => {
        if (!req.body.name && !req.body.link) {
            logger.warn(`User must to provide at least 1 parameter to update`);
            return res.status(400).json({
                message: `You must provide at least name or link`
            });
        }
        const schema = Joi.object({
            name: Joi.string().optional(),
            link: Joi.string().uri().optional()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { name, link } = value;
        try {
            let videoDocument = await videoDao.findOne({ id: req.params.id });
            if (!videoDocument) {
                logger.warn(`Video ${req.params.id} was not found`);
                return res.status(404).json({
                    message: 'Not found'
                });
            }
            if (name)
                videoDocument.name = name;
            if (link)
                videoDocument.link = link;
            const response = await videoDocument.save();
            redis.setex(`video_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_videos`);
            logger.info(`Video (${req.params.id}) was updated successfully`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to edit video - ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }
}

module.exports = Video;