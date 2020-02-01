const express = require('express');
const defaultPlan = require('../controllers/defaultPlan');

const router = express.Router();

router.post('/', defaultPlan.createPlan);
router.put('/:id', defaultPlan.editPlan);
router.delete('/:id', defaultPlan.removePlan);
router.post('/videos/:id', defaultPlan.addVideos);
router.delete('/videos/:id', defaultPlan.removeVideos);
router.get('/', defaultPlan.getAllPlans);
router.get('/:id', defaultPlan.getPlanByID);

module.exports = router;