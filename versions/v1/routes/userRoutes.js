const express = require('express');

const UserController = require('../controller/userController');

const router = express.Router();

router.post('/create-user', UserController.createUser)

module.exports = router;