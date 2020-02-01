const express = require('express');
const video = require('../controllers/video');

const router = express.Router();

router.post('/', video.createVideo);
router.delete('/:id', video.removeVideo);
router.put('/:id', video.editVideo);
router.get('/', video.getAllVideos);
router.get('/:id', video.getVideoByID);

module.exports = router;