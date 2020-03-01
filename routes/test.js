const express = require('express');
const Test = require('../controllers/test');
const { authenticate, blockNotTherapists, blockNotPatients } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const test = new Test();

router.post('/', blockNotPatients, test.createTest);
router.get('/', blockNotTherapists, test.getAllTests);
router.get('/:id', test.getTestByID);
router.get('/patient/:patientID', test.getTestsByPatientID);
router.put('/:id', test.editTest);

module.exports = router;