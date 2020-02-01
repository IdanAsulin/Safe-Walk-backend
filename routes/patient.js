const express = require('express');
const patient = require('../controllers/patient');

const router = express.Router();

router.post('/', patient.createPatient);
router.put('/:id', patient.editPatient);
router.get('/', patient.getAllPatients);
router.get('/:id', patient.getPatientByID);

module.exports = router;