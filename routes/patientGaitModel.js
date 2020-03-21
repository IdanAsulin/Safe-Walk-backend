const express = require('express');
const PatientGaitModel = require('../controllers/patientGaitModel');
const { authenticate, blockNotTherapists, blockNotPatients, checkInCache } = require('../middlewares');

const router = express.Router();
const patientGaitModel = new PatientGaitModel();

router.post('/', [authenticate, blockNotPatients], patientGaitModel.createModel);
router.put('/:testID', patientGaitModel.updateModel);
router.get('/:testID', [authenticate, blockNotTherapists, (req, res, next) => checkInCache(req, res, next, `gaitModel_${req.params.testID}`)], patientGaitModel.getModelByTestID);

module.exports = router;