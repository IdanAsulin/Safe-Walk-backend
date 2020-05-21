const Joi = require('joi');
const redis = require('../redisConnection');
const AbstractPlan = require('./plan');
const planDao = require('../dao/plan');
const utils = require('../utils');
const logger = require('../logger');
const config = require('../config.json');

class RehabPlan extends AbstractPlan {
    constructor() {
        super('rehabPlan');
    }

    addDefaultPlans = async (req, res) => {
        const schema = Joi.object({
            defaultPlanIDs: Joi.array().items(Joi.string()).min(1).required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { defaultPlanIDs } = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument) {
                logger.warn(`Rehab plan ${req.params.id} not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            const defaultPlans = await planDao.find({ id: { $in: defaultPlanIDs }, type: 'defaultPlan' });
            if (defaultPlans.length === 0) {
                logger.warn(`The default plans the user tried to add were not found`);
                return res.status(404).json({
                    message: `The default plans you are trying to add were not found`
                });
            }
            const videosTonsert = [];
            for (let defaultPlan of defaultPlans)
                for (let video of defaultPlan.videos)
                    videosTonsert.push({
                        videoID: video.videoID,
                        times: video.times,
                        timesLeft: video.times,
                        done: false
                    });
            if (utils.checkForDuplicates(videosTonsert, 'videoID')) {
                logger.warn(`The default plans the user tried to add contain some videos which are the same`);
                return res.status(403).json({
                    message: `The default plans you are trying to add contain some videos which are the same`
                });
            }
            planDocument.videos = planDocument.videos.concat(videosTonsert);
            if (utils.checkForDuplicates(planDocument.videos, 'videoID')) {
                logger.warn(`The default plans the user tried to add contains some videos which are already exist in the patient's plan`);
                return res.status(403).json({
                    message: `The default plans you are trying to add contains some videos which are already exist in the patient's plan`
                });
            }
            const response = await planDocument.save();
            redis.setex(`${this.planType}_${planDocument.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_${this.planType}`);
            logger.warn(`Default plans were added successfully to plan ${req.params.id}`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to add default plans to plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    removeDefaultPlans = async (req, res) => {
        const schema = Joi.object({
            defaultPlanIDs: Joi.array().items(Joi.string()).min(1).required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { defaultPlanIDs } = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument) {
                logger.warn(`Rehab plan ${req.params.id} not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            const defaultPlans = await planDao.find({ id: { $in: defaultPlanIDs }, type: 'defaultPlan' });
            if (defaultPlans.length === 0) {
                logger.warn(`The default plans the user tried to remove were not found`);
                return res.status(400).json({
                    message: `The default plans you are trying to remove were not found`
                });
            }
            const videosToRemove = [];
            for (let defaultPlan of defaultPlans)
                for (let video of defaultPlan.videos)
                    videosToRemove.push({ videoID: video.videoID });
            for (let video of videosToRemove) {
                const index = planDocument.videos.findIndex(item => item.videoID === video.videoID);
                if (index !== -1)
                    planDocument.videos.splice(index, 1);
            }
            const response = await planDocument.save();
            redis.setex(`${this.planType}_${planDocument.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_${this.planType}`);
            logger.warn(`Default plans were removed from plan ${req.params.id}`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to remove default plans from plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    markVideoExecution = async (req, res) => {
        const schema = Joi.object({
            videoID: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            logger.warn(`Bad schema of body parameter: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const { videoID } = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument) {
                logger.warn(`Rehab plan ${req.params.id} was not found`);
                return res.status(404).json({
                    message: `Not found`
                });
            }
            let flag = false;
            for (let index = 0; index < planDocument.videos.length; index++) {
                if (planDocument.videos[index].videoID === videoID) {
                    if (planDocument.videos[index].timesLeft > 0)
                        planDocument.videos[index].timesLeft--;
                    if (planDocument.videos[index].timesLeft === 0)
                        planDocument.videos[index].done = true;
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                logger.warn(`Video ${videoID} was not found in rehab plan ${req.params.id}`);
                return res.status(404).json({
                    message: `The video your'e trying to mark as execued was not found`
                });
            }
            const response = await planDocument.save();
            redis.setex(`${this.planType}_${planDocument.id}`, config.CACHE_TTL_FOR_GET_REQUESTS, JSON.stringify(response));
            redis.del(`all_${this.planType}`);
            logger.warn(`Video ${videoID} mark as executed on rehab plan ${req.params.id}`);
            return res.status(200).json(response);
        } catch (ex) {
            logger.error(`Error while trying to mark video ${videoID} on rehab plan ${req.params.id} as executed: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = RehabPlan;