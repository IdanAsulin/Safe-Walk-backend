const express = require('express');
const PatientGaitModel = require('../controllers/patientGaitModel');
const { authenticate, blockNotTherapists } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
router.use(blockNotTherapists);
const patientGaitModel = new PatientGaitModel();

router.post('/', patientGaitModel.createModel);
router.get('/:testID', patientGaitModel.getModelByTestID);

module.exports = router;