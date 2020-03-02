const express = require('express');
const DefaultPlan = require('../controllers/defaultPlan');
const { authenticate, blockNotTherapists, checkInCache } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
router.use(blockNotTherapists);
const defaultPlan = new DefaultPlan();

router.post('/', defaultPlan.createPlan);
router.put('/:id', defaultPlan.editPlan);
router.delete('/:id', defaultPlan.removePlan);
router.put('/:id/videos', defaultPlan.addVideos);
router.delete('/:id/videos', defaultPlan.removeVideos);
router.get('/', (req, res, next) => checkInCache(req, res, next, `all_defaultPlan`), defaultPlan.getAllPlans);
router.get('/:id', (req, res, next) => checkInCache(req, res, next, `defaultPlan_${req.params.id}`), defaultPlan.getPlanByID);

module.exports = router;