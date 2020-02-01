const express = require('express');
const user = require('../controllers/user');

const router = express.Router();

router.post('/', user.createUser);
router.put('/:id', user.editUser);
router.get('/', user.getAllUsers);
router.get('/:id', user.getUserByID);
router.put('/disable/:id', user.disableUser);

module.exports = router;