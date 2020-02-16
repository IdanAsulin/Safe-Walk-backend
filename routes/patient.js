const express = require('express');
const Patient = require('../controllers/patient');

const router = express.Router();

const patient = new Patient();

router.post('/', patient.createPatient);
router.put('/:id', patient.editPatient);
router.get('/', patient.getAllPatients);
router.get('/:id', patient.getPatientByID);
router.put('/test/:id', patient.addTest);

module.exports = router;