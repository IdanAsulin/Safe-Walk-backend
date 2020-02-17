const express = require('express');
const Video = require('../controllers/video');

const router = express.Router();
const video = new Video();

router.post('/', video.createVideo);
router.delete('/:id', video.removeVideo);
router.put('/:id', video.editVideo);
router.get('/', video.getAllVideos);
router.get('/:id', video.getVideoByID);

module.exports = router;