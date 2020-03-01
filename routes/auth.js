const express = require('express');
const Auth = require('../controllers/auth');

const router = express.Router();
const auth = new Auth();

router.post('/login', auth.login);

module.exports = router;