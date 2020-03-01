const express = require('express');
const RehabPlan = require('../controllers/rehabPlan');
const { authenticate, blockNotTherapists } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const rehabPlan = new RehabPlan();

router.post('/', rehabPlan.createPlan);
router.put('/:id', rehabPlan.editPlan);
router.delete('/:id', rehabPlan.removePlan);
router.put('/:id/videos', rehabPlan.addVideos);
router.delete('/:id/videos', rehabPlan.removeVideos);
router.get('/', rehabPlan.getAllPlans);
router.get('/:id', blockNotTherapists, rehabPlan.getPlanByID);
router.put('/:id/defaultPlan', rehabPlan.addDefaultPlans);
router.delete('/:id/defaultPlan', rehabPlan.removeDefaultPlans);

module.exports = router;