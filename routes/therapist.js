const express = require('express');
const Therapist = require('../controllers/therapist');
const { authenticate, blockNotTherapists, checkInCache } = require('../middlewares');

const router = express.Router();
const therapist = new Therapist();

router.post('/', therapist.createTherapist);
router.get('/:id', [authenticate, blockNotTherapists, (req, res, next) => checkInCache(req, res, next, `therapist_${req.params.id}`)], therapist.getTherapistByID);
router.get('/', [authenticate, blockNotTherapists, (req, res, next) => checkInCache(req, res, next, `all_therapists`)], therapist.getAllTherapists);

module.exports = router;