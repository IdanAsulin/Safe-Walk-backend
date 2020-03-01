const express = require('express');
const SensorsKit = require('../controllers/sensorsKit');
const { authenticate, blockNotTherapists, blockNotPatients } = require('../middlewares');

const router = express.Router();
const sensorsKit = new SensorsKit();

router.post('/', [authenticate, blockNotTherapists], sensorsKit.createKit);
router.get('/', [authenticate, blockNotTherapists], sensorsKit.getAllKits);
router.get('/:id', authenticate, sensorsKit.getKitByID);
router.post('/:id/start', [authenticate, blockNotPatients], sensorsKit.start);
router.put('/:id/ips', [authenticate, blockNotPatients], sensorsKit.updateIPs);

module.exports = router;