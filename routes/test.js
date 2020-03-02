const express = require('express');
const Test = require('../controllers/test');
const { authenticate, blockNotTherapists, blockNotPatients, checkInCache } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const test = new Test();

router.post('/', blockNotPatients, test.createTest);
router.get('/', [blockNotTherapists, (req, res, next) => checkInCache(req, res, next, `all_tests`)], test.getAllTests);
router.get('/:id', (req, res, next) => checkInCache(req, res, next, `test_${req.params.id}`), test.getTestByID);
router.get('/patient/:patientID', test.getTestsByPatientID);
router.put('/:id', test.editTest);

module.exports = router;