const express = require('express');
const PatientGaitModel = require('../controllers/patientGaitModel');
const { authenticate, blockNotTherapists, blockNotPatients } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const patientGaitModel = new PatientGaitModel();

router.post('/', blockNotPatients, patientGaitModel.createModel);
router.get('/:testID', blockNotTherapists, patientGaitModel.getModelByTestID);

module.exports = router;