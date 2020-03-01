const express = require('express');
const RehabPlan = require('../controllers/rehabPlan');
const { authenticate, blockNotTherapists, blockNotPatients } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const rehabPlan = new RehabPlan();

router.post('/', blockNotTherapists, rehabPlan.createPlan);
router.put('/:id', blockNotTherapists, rehabPlan.editPlan);
router.delete('/:id', blockNotTherapists, rehabPlan.removePlan);
router.put('/:id/videos', blockNotTherapists, rehabPlan.addVideos);
router.delete('/:id/videos', blockNotTherapists, rehabPlan.removeVideos);
router.get('/', blockNotTherapists, rehabPlan.getAllPlans);
router.get('/:id', rehabPlan.getPlanByID);
router.put('/:id/defaultPlan', blockNotTherapists, rehabPlan.addDefaultPlans);
router.delete('/:id/defaultPlan', blockNotTherapists, rehabPlan.removeDefaultPlans);
router.post('/:id/markVideo', blockNotPatients, rehabPlan.markVideoExecution);

module.exports = router;