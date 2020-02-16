const express = require('express');
const RehabPlan = require('../controllers/rehabPlan');

const router = express.Router();
const rehabPlan = new RehabPlan();

router.post('/', rehabPlan.createPlan);
router.put('/:id', rehabPlan.editPlan);
router.delete('/:id', rehabPlan.removePlan);
router.put('/videos/:id', rehabPlan.addVideos);
router.delete('/videos/:id', rehabPlan.removeVideos);
router.get('/', rehabPlan.getAllPlans);
router.get('/:id', rehabPlan.getPlanByID);
router.put('/defaultPlan/:id', rehabPlan.addDefaultPlans);
// router.put('/defaultPlan/:id', rehabPlan.removeDefaultPlans);

module.exports = router;