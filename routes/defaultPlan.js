const express = require('express');
const DefaultPlan = require('../controllers/defaultPlan');

const router = express.Router();
const defaultPlan = new DefaultPlan();

router.post('/', defaultPlan.createPlan);
router.put('/:id', defaultPlan.editPlan);
router.delete('/:id', defaultPlan.removePlan);
router.put('/videos/:id', defaultPlan.addVideos);
router.delete('/videos/:id', defaultPlan.removeVideos);
router.get('/', defaultPlan.getAllPlans);
router.get('/:id', defaultPlan.getPlanByID);

module.exports = router;