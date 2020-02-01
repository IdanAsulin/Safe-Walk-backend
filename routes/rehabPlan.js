const express = require('express');
const rehabPlan = require('../controllers/rehabPlan');

const router = express.Router();

router.post('/', rehabPlan.createPlan);
router.put('/:id', rehabPlan.editPlan);
router.delete('/:id', rehabPlan.removePlan);
router.put('/videos/:id', rehabPlan.addVideos);
router.delete('/videos/:id', rehabPlan.removeVideos);
router.get('/', rehabPlan.getAllPlans);
router.get('/:id', rehabPlan.getPlanByID);
router.put('/defaultPlan/:id', rehabPlan.addDefaultPlans);
router.delete('/defaultPlan/:id', rehabPlan.removeDefaultPlans);

module.exports = router;