const express = require('express');
const sensorKit = require('../controllers/sensorKit');

const router = express.Router();

router.post('/', sensorKit.createKit);
router.post('/disable/:id', sensorKit.disableKit);
router.get('/', sensorKit.getAllKits);
router.get('/:id', sensorKit.getKitByID);
router.post('/start/:id', sensorKit.start);

module.exports = router;