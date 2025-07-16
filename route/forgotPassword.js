const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPaasword');
const auth = require('../middlewares/auth');

router.post('/forgotPassword', auth, forgotPasswordController.forgotPassword);
router.post('/reset-password/:resetId', auth, forgotPasswordController.resetPassword);
router.get('/check-password-link/:resetId', auth, forgotPasswordController.checkLink);
module.exports = router;
