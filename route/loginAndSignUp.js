const express = require('express');
const router = express.Router();
const userController = require('../controllers/loginAndSignUp');
const auth = require('../middleware/auth');

router.post('/signUp', auth, userController.signUp);
router.post('/login', auth, userController.login);
module.exports = router;
