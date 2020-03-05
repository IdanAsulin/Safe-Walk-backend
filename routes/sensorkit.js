const express = require('express');
const SensorsKit = require('../controllers/sensorsKit');
const { authenticate, blockNotTherapists, blockNotPatients, checkInCache } = require('../middlewares');

const router = express.Router();
const sensorsKit = new SensorsKit();

router.post('/', [authenticate, blockNotTherapists], sensorsKit.createKit);
router.get('/', [authenticate, blockNotTherapists, (req, res, next) => checkInCache(req, res, next, `all_sensorsKit`)], sensorsKit.getAllKits);
router.get('/:id', [authenticate, (req, res, next) => checkInCache(req, res, next, `sensorsKit_${req.params.id}`)], sensorsKit.getKitByID);
router.post('/:id/start', [authenticate, blockNotPatients], sensorsKit.start);
router.put('/:id/ips', sensorsKit.updateIPs);

module.exports = router;