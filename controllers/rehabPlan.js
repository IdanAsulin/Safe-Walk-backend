const Joi = require('joi');
const AbstractPlan = require('./plan');
const planDao = require('../dao/plan');
const utils = require('../utils');

class RehabPlan extends AbstractPlan {
    constructor() {
        super('rehabPlan');
    }

    addDefaultPlans = async (req, res) => {
        if (!req.params.id)
            return res.status(400).json({
                message: `PlanID query parameter was not provided`
            });
        const schema = Joi.object({
            defaultPlans: Joi.array().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.message
            });
        let validatedInput = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument)
                return res.status(404).json({
                    message: `Plan not found`
                });
            const defaultPlans = await planDao.find({ id: { $in: validatedInput.defaultPlans }, type: 'defaultPlan' });
            if (defaultPlans.length === 0)
                return res.status(404).json({
                    message: `The default plans you are trying to add were not found`
                });
            const videosTonsert = [];
            for (let defaultPlan of defaultPlans)
                for (let video of defaultPlan.videos)
                    videosTonsert.push({
                        videoID: video.videoID,
                        times: video.times,
                        done: false,
                        type: 'fromDefault'
                    });
            if (utils.checkForDuplicates(videosTonsert, 'videoID'))
                return res.status(403).json({
                    message: `The default plans you are trying to add contains some videos which are the same`
                });
            planDocument.videos = planDocument.videos.concat(videosTonsert);
            if (utils.checkForDuplicates(planDocument.videos, 'videoID'))
                return res.status(403).json({
                    message: `The default plans you are trying to add contains some videos which are already in the patient plan`
                });
            const response = await planDocument.save();
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to add default plans to plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    removeDefaultPlans = async (req, res) => {
        if (!req.params.id)
            return res.status(400).json({
                message: `PlanID query parameter was not provided`
            });
        const schema = Joi.object({
            defaultPlans: Joi.array().required()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.message
            });
        let validatedInput = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument)
                return res.status(404).json({
                    message: `Plan not found`
                });
            const defaultPlans = await planDao.find({ id: { $in: validatedInput.defaultPlans }, type: 'defaultPlan' });
            if (defaultPlans.length === 0)
                return res.status(404).json({
                    message: `The default plans you are trying to remove were not found`
                });
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
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to remove default plans from plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = RehabPlan;