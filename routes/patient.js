const express = require('express');
const Patient = require('../controllers/patient');
const { authenticate, blockNotTherapists, blockNotPatients } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const patient = new Patient();

router.post('/', blockNotTherapists, patient.createPatient);
router.put('/:id', blockNotTherapists, patient.editPatient);
router.get('/', blockNotTherapists, patient.getAllPatients);
router.get('/:id', patient.getPatientByID);
router.put('/:id/test', blockNotPatients,  patient.addTest);

module.exports = router;