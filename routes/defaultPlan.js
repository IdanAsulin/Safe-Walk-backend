const express = require('express');
const DefaultPlan = require('../controllers/defaultPlan');
const { authenticate, blockNotTherapists } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
router.use(blockNotTherapists);
const defaultPlan = new DefaultPlan();

router.post('/', defaultPlan.createPlan);
router.put('/:id', defaultPlan.editPlan);
router.delete('/:id', defaultPlan.removePlan);
router.put('/:id/videos', defaultPlan.addVideos);
router.delete('/:id/videos', defaultPlan.removeVideos);
router.get('/', defaultPlan.getAllPlans);
router.get('/:id', defaultPlan.getPlanByID);

module.exports = router;