const express = require('express');

const UserController = require('../controller/userController');
const { authenticated, isAdmin } = require('../../../middleware/auth');

const router = express.Router();

router.post('/login-user', UserController.loginUser);
router.post('/signup-user', UserController.signupUser);
router.post('/create-user', authenticated, isAdmin, UserController.createUser);
router.post('/update-user', authenticated, isAdmin, UserController.updateUser);

router.get('/get-all-users', authenticated, isAdmin, UserController.getAllUsers);
router.get('/get-user-details', authenticated, UserController.getUserDetails);

module.exports = router;