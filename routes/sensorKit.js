const express = require('express');
const SensorsKit = require('../controllers/sensorsKit');
const { authenticate, blockNotTherapists, blockNotPatients, checkInCache } = require('../middlewares');

const router = express.Router();
const sensorsKit = new SensorsKit();

router.get('/', [authenticate, blockNotTherapists, (req, res, next) => checkInCache(req, res, next, `all_sensorsKit`)], sensorsKit.getAllKits);
router.get('/:id', [authenticate, (req, res, next) => checkInCache(req, res, next, `sensorsKit_${req.params.id}`)], sensorsKit.getKitByID);
router.post('/:id/analyzeRawData', [authenticate, blockNotPatients], sensorsKit.analyzeRawData);
router.put('/:id/ips', sensorsKit.updateIPs);

module.exports = router;
