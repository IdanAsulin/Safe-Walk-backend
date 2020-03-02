const express = require('express');
const Video = require('../controllers/video');
const { authenticate, blockNotTherapists, checkInCache } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
router.use(blockNotTherapists);
const video = new Video();

router.post('/', video.createVideo);
router.delete('/:id', video.removeVideo);
router.put('/:id', video.editVideo);
router.get('/', (req, res, next) => checkInCache(req, res, next, `all_videos`), video.getAllVideos);
router.get('/:id', (req, res, next) => checkInCache(req, res, next, `video_${req.params.id}`), video.getVideoByID);

module.exports = router;