const express = require('express');
const Test = require('../controllers/test');

const router = express.Router();
const test = new Test();

router.post('/', test.createTest);
router.get('/', test.getAllTests);
router.get('/:id', test.getTestByID);
router.get('/patient/:patientID', test.getTestsByPatientID);
router.put('/:id', test.editTest);

module.exports = router;