const express = require('express');
const Therapist = require('../controllers/therapist');
const { authenticate, blockNotTherapists } = require('../middlewares');

const router = express.Router();
const therapist = new Therapist();

router.post('/', therapist.createTherapist);
router.get('/:id', [authenticate, blockNotTherapists], therapist.getTherapistByID);
router.get('/', [authenticate, blockNotTherapists], therapist.getAllTherapists);

module.exports = router;