const express = require('express');
const Video = require('../controllers/video');
const { authenticate, blockNotTherapists } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
router.use(blockNotTherapists);
const video = new Video();

router.post('/', video.createVideo);
router.delete('/:id', video.removeVideo);
router.put('/:id', video.editVideo);
router.get('/', video.getAllVideos);
router.get('/:id', video.getVideoByID);

module.exports = router;