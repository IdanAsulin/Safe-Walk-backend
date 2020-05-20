const express = require('express');
const Patient = require('../controllers/patient');
const { authenticate, blockNotTherapists, checkInCache } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const patient = new Patient();

router.post('/', blockNotTherapists, patient.createPatient);
router.put('/:id', patient.editPatient);
router.get('/', [blockNotTherapists, (req, res, next) => checkInCache(req, res, next, 'all_patients')], patient.getAllPatients);
router.get('/:id', (req, res, next) => checkInCache(req, res, next, `patient_${req.params.id}`), patient.getPatientByID);

module.exports = router;