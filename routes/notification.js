const express = require('express');
const Notification = require('../controllers/notification');
const { authenticate, blockNotTherapists } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
router.use(blockNotTherapists);
const notification = new Notification();

router.get('/lastDay', notification.getLastDay);

module.exports = router;