const videoDao = require('../dao/video')
const Joi = require('joi')

class Video {
    createVideo = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            link: Joi.string().uri().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { name, link } = value;
        const videoToCreate = new videoDao({ name, link });
        try {
            const videoExist = await videoDao.findOne({ link: req.body.link });
            if (videoExist)
                return res.status(409).json({
                    message: 'Video already exists'
                });
            const addedVideo = await videoToCreate.save();
            console.log(`Video was created succesfully - videoID: ${addedVideo.id}`);
            return res.status(400).json(addedVideo);
        } catch (err) {
            console.error(`Error while trying to create new video: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    removeVideo = async (req, res) => {
        try {
            const response = await videoDao.findOneAndRemove({ id: req.params.id });
            if (!response)
                return res.status(404).json({
                    message: `Not found`
                });
            console.log(`Video - ${req.params.id} - was succesfully removed`);
            return res.status(200).json();
        } catch (err) {
            console.error(`Error while trying to remove video - ${req.params.id}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getAllVideos = async (req, res) => {
        try {
            const response = await videoDao.find();
            if (response.length === 0)
                return res.status(404).json({
                    message: `Not found`
                });
            return res.status(200).json(response);
        } catch (err) {
            console.log(`Error while trying to get all videos: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    getVideoByID = async (req, res) => {
        try {
            const response = await videoDao.findOne({ id: req.params.id });
            if (!response)
                return res.status(404).json({
                    message: "Not found"
                });
            console.log(`Returns video - videoID: ${req.params.id}`);
            return res.status(200).json(response);
        } catch (err) {
            console.error(`Error while trying to get video ID - ${req.params.id}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    editVideo = async (req, res) => {
        if (!req.body.name && !req.body.link)
            return res.status(400).json({
                message: `You must provide at least name or link`
            });
        const schema = Joi.object({
            name: Joi.string().optional(),
            link: Joi.string().uri().optional()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { name, link } = value;
        try {
            let videoDocument = await videoDao.findOne({ id: req.params.id });
            if (!videoDocument)
                return res.status(404).json({
                    message: 'Not found'
                });
            if (name)
                videoDocument.name = name;
            if (link)
                videoDocument.link = link;
            const response = await videoDocument.save();
            console.log(`Video (${req.params.id}) was updated successfully`);
            return res.status(200).json(response);
        } catch (err) {
            console.error(`Error while trying to edit video - ${req.params.id}: ${err.message}`);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }
}

module.exports = Video;