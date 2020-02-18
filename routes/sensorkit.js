const express = require('express');
const SensorKit = require('../controllers/sensorKit');

const router = express.Router();
const sensorsKit = new SensorKit()

router.post('/', sensorsKit.createKit);
router.get('/', sensorsKit.getAllKits);
router.get('/:id', sensorsKit.getKitByID);
router.post('/:id/start', sensorsKit.start);
router.put('/:id/ips', sensorsKit.updateIPs);

module.exports = router;