const express = require('express');

const UserController = require('../controller/userController');
const { authenticated, isAdmin } = require('../../../middleware/auth');

const router = express.Router();

router.post('/login-user', UserController.loginUser);
router.post('/signup-user', UserController.signupUser);
router.post('/create-user', authenticated, isAdmin, UserController.createUser);

router.get('/get-all-users', authenticated, isAdmin, UserController.getAllUsers);

module.exports = router;