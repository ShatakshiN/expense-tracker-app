const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgotPaasword');
const auth = require('../middlewares/auth');

router.post('/forgotPassword', auth, forgotPasswordController.  )
module.exports = router;
