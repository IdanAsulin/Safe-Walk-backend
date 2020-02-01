const express = require('express');
const user = require('../controllers/user');

const router = express.Router();

router.post('/', user.createUser);
router.post('/password/:id', user.changePassword);
router.get('/', user.getAllUsers);
router.get('/:email', user.getUserByEmail);
router.post('/disable/:email', user.disableUser);

module.exports = router;