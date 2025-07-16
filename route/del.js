const express = require('express');
const router = express.Router();
const delController = require('../controllers/del');
const auth = require('../middleware/auth');

//router.get('/messages/:receiverId', auth, chatController.getChatMessages);
router.delete('/delete-expense/:expenseId', auth, delController.)


module.exports = router;
