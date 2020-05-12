const Joi = require('joi');
const redis = require('../redisConnection');
const planDao = require('../dao/plan');
const videoDao = require('../dao/video');
const patientDao = require('../dao/patient');
const therapistDao = require('../dao/therapist');
const utils = require('../utils');
const logger = require('../logger');
const config = require('../config.json');
const { getFromRedis } = require('../utils');

class AbstractPlan {
    constructor(planType) {
        if (planType !== 'defaultPlan' && planType !== 'rehabPlan') {
            logger.error(`Unsupported plan type ${planType}`);
            throw new Error(`Unsupported plan type`);
        }
        this.planType = planType;
    }

    createPlan = async (req, res) => {
        let schema;
        if (this.planType === 'defaultPlan') {
            schema = Joi.object({
                name: Joi.string().required(),
                instructions: Joi.string().required(),
                videos: Joi.array().items({
                    videoID: Joi.string().required(),
                    times: Joi.number().min(1).required()
                }).min(1).required()
            });
        }
        else {
            schema = Joi.object({
                name: Joi.string().required(),
                patientID: Joi.string().required(),
                instructions: Joi.string().required(),
                videos: Joi.array().items({
                    videoID: Joi.string().required(),
                    times: Joi.number().min(1).required()
                }).min(1).required(),
                therapistID: Joi.string().required(),
                defaultPlans: Joi.array().items(Joi.string()).min(1)
            });
        }
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        let { name, instructions, videos } = value;
        let patientID, therapistID, defaultPlans;
        const type = this.planType;
        if (this.planType === 'rehabPlan') {
            defaultPlans = value.defaultPlans;
            therapistID = value.therapistID;
            patientID = value.patientID;
        }
        try {
            let response;
            let defaultPlanVideos = [];
            if (this.planType === 'rehabPlan') {
                response = await planDao.findOne({ patientID });
                if (response) {
                    logger.warn(`Patient ${patientID} already have rehabilitation plan`);
                    return res.status(409).json({
                        message: `This patient already have rehabilitation plan`
                    });
                }
                response = await getFromRedis(`patient_${patientID}`);
                if (!response.found) {
                    response = await patientDao.findOne({ id: patientID });
                    redis.setex(`patient_${patientID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
                }
                else response = response.data;
                if (!response) {
                    logger.warn(`Patient ${patientID} is not exist`);
                    return res.status(400).json({
                        message: `The patient you have sent is not exist`
                    });
                }
                response = await getFromRedis(`therapist_${therapistID}`);
                if (!response.found) {
                    response = await therapistDao.findOne({ id: therapistID });
                    redis.setex(`therapist_${therapistID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
                }
                else response = response.data;
                if (!response) {
                    logger.warn(`Therapist ${therapistID} is not exist`);
                    return res.status(400).json({
                        message: `The therapist you have sent is not exist`
                    });
                }
                if (defaultPlans) {
                    response = await planDao.find({ id: { $in: defaultPlans } });
                    if (response.length !== defaultPlans.length) {
                        logger.warn(`Some of the default plans the user sent are not exist`);
                        return res.status(400).json({
                            message: `Some of the default plans you have sent are not exist`
                        });
                    }
                    for (let defaultPlan of response)
                        for (let video of defaultPlan.videos)
                            defaultPlanVideos.push(video._doc);
                    videos = videos.concat(defaultPlanVideos);
                }
                for (let index = 0; index < videos.length; index++)
                    videos[index] = { ...videos[index], done: false };
            }
            let videoIDs = [];
            for (let video of videos)
                videoIDs.push(video.videoID);
            if (utils.checkForDuplicates(videos, 'videoID')) {
                logger.warn(`User sent duplicated videos`);
                return res.status(403).json({
                    message: `You've sent duplicated videos`
                });
            }
            response = await videoDao.find({ id: { $in: videoIDs } });
            if (response.length !== videos.length) {
                logger.warn(`User sent videos which are not exist`);
                return res.status(400).json({
                    message: `You've sent videos which are not exist`
                });
            }
            let newPlan;
            if (this.planType === 'defaultPlan')
                newPlan = new planDao({ name, instructions, videos, type });
            else
                newPlan = new planDao({ name, instructions, videos, type, therapistID, patientID });
            response = await newPlan.save();
            if (this.planType === 'rehabPlan') {
                let patientDoc = await patientDao.findOne({ id: patientID });
                patientDoc.rehabPlanID = response.id;
                await patientDoc.save();
                redis.setex(`patient_${patientID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(patientDoc));
                redis.del(`all_patients`);
            }
            redis.setex(`${this.planType}_${response.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_${this.planType}`);
            logger.info(`${this.planType} created successfully -- planID: ${response.id}`);
            return res.status(201).json(response);
        } catch (ex) {
            logger.error(`Error while trying to create new plan: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    editPlan = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string(),
            instructions: Joi.string(),
            videos: Joi.array().items({
                videoID: Joi.string().required(),
                times: Joi.number().min(1).required()
            }),
            therapistID: Joi.string(),
            defaultPlanIDs: Joi.array().items(Joi.string())
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { name, instructions, videos, therapistID, defaultPlanIDs } = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument) {
                logger.warn(`${this.planType} - ${req.params.id} not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            if (!name && !instructions && !videos && !therapistID) {
                logger.warn(`User have to provide at least one parameter to update`);
                return res.status(400).json({
                    message: `You have to provide at least one parameter to update`
                });
            }
            if (name)
                planDocument.name = name;
            if (instructions)
                planDocument.instructions = instructions;
            if (therapistID) {
                const therapist = await therapistDao.findOne({ id: therapistID });
                if (!therapist) {
                    logger.warn(`User provided therapist ${therapistID} which is not exist`);
                    return res.status(400).json({
                        message: `You have to provide an exist therapist`
                    });
                }
                planDocument.therapistID = therapistID;
            }
            if (videos && videos.length > 0 && this.planType === 'defaultPlan') {
                const videoIDs = videos.map(video => video.videoID);
                logger.info(videoIDs);
                const videosDocs = await videoDao.find({ id: { $in: videoIDs } });
                if (videosDocs.length !== videos.length) {
                    logger.warn(`User provided some videos which are not exist`);
                    return res.status(400).json({
                        message: `You have to provide an exist videos`
                    });
                }
                planDocument.videos = videos;
            }
            if (videos && videos.length > 0 && this.planType === 'rehabPlan') {
                const videoIDs = videos.map(video => video.videoID);
                const videosDocs = await videoDao.find({ id: { $in: videoIDs } });
                if (videosDocs.length !== videos.length) {
                    logger.warn(`User provided some videos which are not exist`);
                    return res.status(400).json({
                        message: `You have to provide an exist videos`
                    });
                }
                const videosToUpdate = [];
                for (let video of videos)
                    videosToUpdate.push({ ...video, done: false });
                planDocument.videos = videosToUpdate;
            }
            if (defaultPlanIDs && defaultPlanIDs.length > 0 && this.planType === 'rehabPlan') {
                const defaultPlans = await planDao.find({ id: { $in: defaultPlanIDs }, type: 'defaultPlan' });
                if (defaultPlans.length !== defaultPlanIDs.length) {
                    logger.warn(`User provided some default plans which are not exist`);
                    return res.status(400).json({
                        message: `You have to provide an exist default plans`
                    });
                }
                const videosToUpdate = [...planDocument.videos];
                for (let defaultPlan of defaultPlans)
                    for (let video of defaultPlan.videos)
                        videosToUpdate.push({
                            videoID: video.videoID,
                            times: video.times,
                            done: false
                        });
                planDocument.videos = videosToUpdate;
            }
            const response = await planDocument.save();
            redis.setex(`${this.planType}_${planDocument.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_${this.planType}`);
            logger.info(`${this.planType} was updated successfully`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to update plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    removePlan = async (req, res) => {
        try {
            const response = await planDao.findOneAndRemove({ id: req.params.id, type: this.planType });
            if (response) {
                redis.del(`${this.planType}_${req.params.id}`);
                redis.del(`all_${this.planType}`);
                logger.info(`${this.planType} was removed successfully`);
                if (this.planType === 'rehabPlan') {
                    let patient = await patientDao.findOne({ id: response.patientID });
                    patient.rehabPlanID = "";
                    await patient.save();
                    redis.setex(`patient_${response.patientID}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(patient));
                    redis.del(`all_patients`);
                }
                return res.status(200).json();
            }
            return res.status(202).json();
        } catch (ex) {
            logger.error(`Error while trying to remove plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getAllPlans = async (req, res) => {
        try {
            const response = await planDao.find({ type: this.planType }).select('-_id').select('-__v');
            redis.setex(`all_${this.planType}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            logger.info(`All plans returned to the client`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get all plans: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getPlanByID = async (req, res) => {
        try {
            const response = await planDao.findOne({ id: req.params.id, type: this.planType }).select('-_id').select('-__v');
            redis.setex(`${this.planType}_${req.params.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            if (!response) {
                logger.warn(`${this.planType} - ${req.params.id} not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            logger.info(`${this.planType} - ${req.params.id} returned to the client`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to get plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    addVideos = async (req, res) => {
        const schema = Joi.object({
            videos: Joi.array().items({
                videoID: Joi.string().required(),
                times: Joi.number().min(1).required()
            }).min(1).required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { videos } = value;
        const videoIDs = [];
        for (let video of videos)
            videoIDs.push(video.videoID);
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument) {
                logger.warn(`${this.planType} - ${req.params.id} not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            if (utils.checkForDuplicates(videos, 'videoID')) {
                logger.warn(`User has sent duplicated videos to update`);
                return res.status(403).json({
                    message: `You've sent duplicated videos`
                });
            }
            const videosDocs = await videoDao.find({ id: { $in: videoIDs } });
            if (videosDocs.length !== videos.length) {
                logger.warn(`User has sent videos to update which are not exist`);
                return res.status(400).json({
                    message: `You've sent videos which are not exist`
                });
            }
            if (this.planType === 'rehabPlan') {
                for (let index = 0; index < videos.length; index++)
                    videos[index] = { ...videos[index], done: false };
            }
            planDocument.videos = planDocument.videos.concat(videos);
            if (utils.checkForDuplicates(planDocument.videos, 'videoID')) {
                logger.warn(`User has sent videos to update which are already exist`);
                return res.status(403).json({
                    message: `You've sent videos which are already exist`
                });
            }
            const response = await planDocument.save();
            redis.setex(`${this.planType}_${planDocument.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_${this.planType}`);
            logger.info(`Videos were added successfully to ${this.planType} - ${req.params.id}`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to add videos to plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    removeVideos = async (req, res) => {
        const schema = Joi.object({
            videoIDs: Joi.array().items(Joi.string()).min(1).required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { videoIDs } = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument) {
                logger.warn(`${this.planType} - ${req.params.id} not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            for (let videoID of videoIDs) {
                const index = planDocument.videos.findIndex(item => item.videoID === videoID);
                if (index !== -1)
                    planDocument.videos.splice(index, 1);
            }
            if (planDocument.videos.length === 0) {
                logger.warn(`User is trying to delete all videos from plan, in such case you have to remove the all plan`);
                return res.status(400).json({
                    message: `You are trying to delete all videos from plan, in such case you have to remove the all plan`
                });
            }
            const response = await planDocument.save();
            redis.setex(`${this.planType}_${planDocument.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_${this.planType}`);
            logger.info(`Videos were removed successfully from ${this.planType} ${req.params.id}`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to remove videos from plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = AbstractPlan;