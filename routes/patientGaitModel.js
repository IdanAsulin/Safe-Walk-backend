const express = require('express');
const PatientGaitModel = require('../controllers/patientGaitModel');
const { authenticate, blockNotTherapists, blockNotPatients, checkInCache } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const patientGaitModel = new PatientGaitModel();

router.post('/', blockNotPatients, patientGaitModel.createModel);
router.get('/:testID', [blockNotTherapists, (req, res, next) => checkInCache(req, res, next, `gaitModel_${req.params.testID}`)], patientGaitModel.getModelByTestID);

module.exports = router;