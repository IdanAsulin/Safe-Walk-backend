const express = require('express');
const Therapist = require('../controllers/therapist');

const router = express.Router();
const therapist = new Therapist();

router.post('/', therapist.createTherapist);
router.get('/:id', therapist.getTherapistByID);
router.get('/', therapist.getAllTherapists);

module.exports = router;