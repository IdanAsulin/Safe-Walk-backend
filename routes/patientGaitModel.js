const express = require('express');
const PatientGaitModel = require('../controllers/patientGaitModel');
const router = express.Router();

const patientGaitModel = new PatientGaitModel()
router.post('/', patientGaitModel.createModel);
router.get('/:id', patientGaitModel.getModelByID);

module.exports = router;