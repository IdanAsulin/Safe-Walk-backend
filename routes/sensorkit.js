const express = require('express');
const SensorsKit = require('../controllers/sensorsKit');

const router = express.Router();
const sensorsKit = new SensorsKit();

router.post('/', sensorsKit.createKit);
router.get('/', sensorsKit.getAllKits);
router.get('/:id', sensorsKit.getKitByID);
router.post('/:id/start', sensorsKit.start);
router.put('/:id/ips', sensorsKit.updateIPs);

module.exports = router;