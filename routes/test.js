const express = require('express');
const Test = require('../controllers/test');
const { authenticate, blockNotTherapists } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const test = new Test();

router.post('/', test.createTest);
router.get('/', blockNotTherapists, test.getAllTests);
router.get('/:id', test.getTestByID);
router.get('/patient/:patientID', test.getTestsByPatientID);
router.put('/:id', test.editTest);

module.exports = router;