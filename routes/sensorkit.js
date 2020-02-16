const express = require('express');
const SensorKit = require('../controllers/sensorKit');

const router = express.Router();
const sensorKit = new SensorKit()

router.post('/', sensorKit.createKit);
router.post('/disable/:id', sensorKit.disableKit);
router.get('/', sensorKit.getAllKits);
router.get('/:id', sensorKit.getKitByID);
router.post('/:id/start', sensorKit.start);
router.put('/ips/:id', sensorKit.updateIPs);

module.exports = router;