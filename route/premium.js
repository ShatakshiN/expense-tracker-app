const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premium');
const auth = require('../middleware/auth');

router.get('/buy-premium', auth, premiumController.buyPremium);
router.post('/updatetransectionstatus', auth, premiumController.updateTransectionStatus);
router.get('/check-premium-status', auth, premiumController.checkPremium);
router.get('/premium/LeaderBoard', auth, premiumController.leaderBoard);
router.get("/download-expense", auth ,premiumController.downloadExp);
router.get('/downloaded-files', auth,premiumController.downloadedExpFiles);

module.exports = router;
