const videoDao = require('../dao/video')
const Joi = require('joi')

class Video {
    createVideo = async (req , res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            duration: Joi.number().min(0).required(),
            link: Joi.string().required()
        });

        const {error , value} = schema.validate(req.body);
        if (error) {
            console.error('error: ' , error);
            return res.status(400).json({
                message: error.message
            });
        }

        const videoToCreate = new videoDao(value);
        try {
            const isEntityExistInDB = await videoDao.findOne({link: req.body.link});
            if (!isEntityExistInDB) {
                const addedVideo = await videoToCreate.save();
                console.log(`a video was created succesfully- videoID: ${addedVideo.id}`);
                return res.status(400).json({
                    video: addedVideo
                });
            } else {
                return res.status(409).json({
                    message: 'video already exists'
                });
            }
        } catch(err) {        const schema = Joi.object({
            name: Joi.string().required(),
            duration: Joi.number().min(0).required(),
            link: Joi.string().required()
        });

            console.error(err);
            return res.status(500).json({
                message: err.message
            });
        }
    }

    removeVideo = async (req , res) => {
        console.log('req.params:', req.params.id);
        try {
            const response = await videoDao.findOneAndRemove({id: req.params.id});
            if(!response) {
                console.log("video not found");
                return res.status(202).json({
                    message: 'video not found'
                })
            }
            console.log(`video was succesfully removed- videoID: ${response.id}`);
            return res.status(202).json(response);
        } catch(err) {
            console.error('error: ' , err)
            return res.status(500).json({
                message: err.message
            })
        }
    }

    getAllVideos = async (req , res) => {
        try {
            const response = await videoDao.find();
            return res.status(202).json(response);
        } catch(err) {
            console.log('err: ', err);
            return res.status(501).json({
                message: err.message
            });
        }
    }

    getVideoByID = async (req , res) => {
        if(!req.params.id) {
            console.log("id required as param")
            return res.status(400).json({
                message: "id required as param"
            })
        }
        try {
            const response = await videoDao.findOne({id: req.params.id});
            if(!response) {
                console.log("video not found");
                return res.status(202).json({
                    message: "video not found"
                });
            }
            console.log(`found video succesfully- videoID: ${response.id}`);
            return res.status(202).json(response);
        } catch(err) {
            console.error("error: ", err);
            return res.status(500).json({
                message: err.message
            });
        }
    }

    editVideo = async (req , res) => {
        if (!req.params.id) {
            return res.status(400).json({
                message: 'videoID parameter is required'
            })
        }

        const schema = Joi.object({
            name: Joi.string().required(),
            duration: Joi.number().min(0).required(),
            link: Joi.string().required()
        });

        const {error , value} = schema.validate(req.body);
        if (error) {
            console.error('error: ' , error);
            return res.status(400).json({
                message: error.message
            });
        }
        try{
            let videoDocument = await videoDao.findOne({id: req.params.id})
            if(!videoDocument) {
                return res.status(404).json({
                    message: 'video not found'
                })
            }
        if(value.name)
            videoDocument.name = value.name;
        if (value.duration)
            videoDocument.duration = value.duration;
        if (value.link)
            videoDocument.link = value.link;

        const response = await videoDocument.save();
        console.log(`video (${req.params.id}) was updated successfully`);
        return res.status(200).json(response)
        } catch(err) {
            console.error('error:' , err)
            return res.status(500).json({
                message: err.message
            })
        }
    }
}

module.exports = Video