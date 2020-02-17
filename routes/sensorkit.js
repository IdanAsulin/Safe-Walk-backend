const express = require('express');
const SensorKit = require('../controllers/sensorKit');

const router = express.Router();
const sensorKit = new SensorKit()

router.post('/', sensorKit.createKit);
router.post('/:id/disable', sensorKit.disableKit);
router.get('/', sensorKit.getAllKits);
router.get('/:id', sensorKit.getKitByID);
router.post('/:id/start', sensorKit.start);
router.put('/:id/ips', sensorKit.updateIPs);

module.exports = router;