const express = require('express');
const Video = require('../controllers/video');
const { authenticate, blockNotTherapists, checkInCache } = require('../middlewares');

const router = express.Router();
router.use(authenticate);
const video = new Video();

router.post('/', blockNotTherapists, video.createVideo);
router.delete('/:id', blockNotTherapists, video.removeVideo);
router.put('/:id', blockNotTherapists, video.editVideo);
router.get('/', (req, res, next) => {
    if (!req.query.videoIDs)
        return checkInCache(req, res, next, `all_videos`);
    else
        next();

}, video.getAllVideos);
router.get('/:id', (req, res, next) => checkInCache(req, res, next, `video_${req.params.id}`), video.getVideoByID);

module.exports = router;