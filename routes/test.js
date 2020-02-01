const express = require('express');
const test = require('../controllers/test');

const router = express.Router();

router.post('/', test.createTest);
router.get('/', test.getAllTests);
router.get('/:id', test.getTestByID);
router.get('/:patientID', test.getTestsByPatientID);

module.exports = router;