const planDao = require('../dao/plan');
const Joi = require('joi');
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
                videos: Joi.array().required(),
            });
        }
        else {
            schema = Joi.object({
                name: Joi.string().required(),
                patientID: Joi.string().required(),
                instructions: Joi.string().required(),
                videos: Joi.array().required(),
                therapistID: Joi.string().required(),
                defaultPlans: Joi.array()
            });
        }
        const { error, value } = schema.validate(req.body);
        if (error)
            return res.status(400).json({
                message: error.message
            });
        let validatedInput = value;
        validatedInput.type = this.planType;
        if (this.planType === 'rehabPlan') {
            for (let index = 0; index < validatedInput.videos.length; index++)
                validatedInput.videos[index] = { ...validatedInput.videos[index], done: false };
        }
        const newPlan = new planDao(validatedInput);
        try {
            let response;
            if (this.planType === 'rehabPlan') {
                response = await planDao.findOne({ patientID: validatedInput.patientID });
                if (response)
                    return res.status(409).json({
                        message: `This patient already have rehabilitation plan`
                    });
            }
            if (utils.checkForDuplicates(validatedInput.videos, 'videoID'))
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
        if (!req.params.id)
            return res.status(400).json({
                message: `PlanID query parameter was not provided`
            });
        const schema = Joi.object({
            name: Joi.string(),
            instructions: Joi.string()
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
            if (validatedInput.name)
                planDocument.name = validatedInput.name;
            if (validatedInput.instructions)
                planDocument.instructions = validatedInput.instructions;
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
        if (!req.params.id)
            return res.status(400).json({
                message: `PlanID query parameter was not provided`
            });
        try {
            await planDao.findOneAndRemove({ id: req.params.id, type: this.planType });
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
            return res.status(200).json(response);
        } catch (ex) {
            console.error(`Error while trying to get all plans: ${ex.message}`);
            return res.status(500).json({
                message: `Internal server error`
            });
        }
    }

    getPlanByID = async (req, res) => {
        if (!req.params.id)
            return res.status(400).json({
                message: `PlanID query parameter was not provided`
            });
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
        if (!req.params.id)
            return res.status(400).json({
                message: `PlanID query parameter was not provided`
            });
        const schema = Joi.object({
            videos: Joi.array().required()
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
            if (utils.checkForDuplicates(validatedInput.videos, 'videoID'))
                return res.status(403).json({
                    message: `You've sent duplicated videos`
                });
            if (this.planType === 'rehabPlan') {
                for (let index = 0; index < validatedInput.videos.length; index++)
                    validatedInput.videos[index] = { ...validatedInput.videos[index], done: false };
            }
            planDocument.videos = planDocument.videos.concat(validatedInput.videos)
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
        if (!req.params.id)
            return res.status(400).json({
                message: `PlanID query parameter was not provided`
            });
        const schema = Joi.object({
            videos: Joi.array().required()
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
            for (let videoID of validatedInput.videos) {
                const index = planDocument.videos.findIndex(item => item.videoID === videoID);
                if (index !== -1)
                    planDocument.videos.splice(index, 1);
            }
            if (planDocument.videos.length === 0)
                return res.status(400).json({
                    message: `You can not delete all videos from plan`
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