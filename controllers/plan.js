const Joi = require('joi');
const planDao = require('../dao/plan');
const videoDao = require('../dao/video');
const utils = require('../utils');

class AbstractPlan {
    constructor(planType) {
        if (planType !== 'defaultPlan' && planType !== 'rehabPlan')
            throw new Error(`Unsupported plan type`);
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
        // else {
        //     schema = Joi.object({
        //         name: Joi.string().required(),
        //         patientID: Joi.string().required(),
        //         instructions: Joi.string().required(),
        //         videos: Joi.array().required(),
        //         therapistID: Joi.string().required(),
        //         defaultPlans: Joi.array()
        //     });
        // }
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { name, instructions, videos } = value;
        const type = this.planType;
        // if (planType === 'rehabPlan') {
        //     for (let index = 0; index < videos.length; index++)
        //         validatedInput.videos[index] = { ...validatedInput.videos[index], done: false };
        // }
        const videoIDs = [];
        for (let video of videos)
            videoIDs.push(video.videoID);
        try {
            const newPlan = new planDao({ name, instructions, videos, type });
            let response;
            response = await videoDao.find({ id: { $in: videoIDs } });
            if (response.length !== videos.length)
                return res.status(400).json({
                    message: `You've sent videos which are not exist`
                });
            // if (this.planType === 'rehabPlan') {
            //     response = await planDao.findOne({ patientID: validatedInput.patientID });
            //     if (response)
            //         return res.status(409).json({
            //             message: `This patient already have rehabilitation plan`
            //         });
            // }
            if (utils.checkForDuplicates(videos, 'videoID'))
                return res.status(403).json({
                    message: `You've sent duplicated videos`
                });
            response = await newPlan.save();
            return res.status(201).json(response);
        } catch (ex) {
            console.error(`Error while trying to create new plan: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    editPlan = async (req, res) => {
        const schema = Joi.object({
            name: Joi.string(),
            instructions: Joi.string()
        });
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { name, instructions } = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument)
                return res.status(404).json({
                    message: `Not found`
                });
            if (!name && !instructions)
                return res.status(400).json({
                    message: `You have to provide at least one parameter to update`
                });
            if (name)
                planDocument.name = name;
            if (instructions)
                planDocument.instructions = instructions;
            const response = await planDocument.save();
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to update plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    removePlan = async (req, res) => {
        try {
            const response = await planDao.findOneAndRemove({ id: req.params.id, type: this.planType });
            if (response) return res.status(200).json();
            return res.status(202).json();
        } catch (ex) {
            console.error(`Error while trying to remove plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getAllPlans = async (req, res) => {
        try {
            const response = await planDao.find({ type: this.planType });
            if (response.length === 0)
                return res.status(404).json({
                    message: `Not found`
                });
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to get all plans: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getPlanByID = async (req, res) => {
        try {
            const response = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!response)
                return res.status(404).json({
                    message: `Not found`
                });
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to get plan ${req.params.id}: ${ex.message}`);
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
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { videos } = value;
        const videoIDs = [];
        for (let video of videos)
            videoIDs.push(video.videoID);
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument)
                return res.status(404).json({
                    message: `Not found`
                });
            const videosDocs = await videoDao.find({ id: { $in: videoIDs } });
            if (videosDocs.length !== videos.length)
                return res.status(400).json({
                    message: `You've sent videos which are not exist`
                });
            if (utils.checkForDuplicates(videos, 'videoID'))
                return res.status(403).json({
                    message: `You've sent duplicated videos`
                });
            // if (this.planType === 'rehabPlan') {
            //     for (let index = 0; index < validatedInput.videos.length; index++)
            //         validatedInput.videos[index] = { ...validatedInput.videos[index], done: false };
            // }
            planDocument.videos = planDocument.videos.concat(videos)
            if (utils.checkForDuplicates(planDocument.videos, 'videoID'))
                return res.status(403).json({
                    message: `You've sent videos which are already exist`
                });
            const response = await planDocument.save();
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to add videos to plan ${req.params.id}: ${ex.message}`);
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
        if (error)
            return res.status(400).json({
                message: error.details[0].message
            });
        const { videoIDs } = value;
        try {
            const planDocument = await planDao.findOne({ id: req.params.id, type: this.planType });
            if (!planDocument)
                return res.status(404).json({
                    message: `Not found`
                });
            for (let videoID of videoIDs) {
                const index = planDocument.videos.findIndex(item => item.videoID === videoID);
                if (index !== -1)
                    planDocument.videos.splice(index, 1);
            }
            if (planDocument.videos.length === 0)
                return res.status(400).json({
                    message: `You are trying to delete all videos from plan, in such case you have to remove the all plan`
                });
            const response = await planDocument.save();
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to remove videos from plan ${req.params.id}: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }
}

module.exports = AbstractPlan;