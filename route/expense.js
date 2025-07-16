const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const expController = require('../controllers/expense');
require('dotenv').config();

//middleware
const middleware = require('../middleware/auth');

// Models
const Expense = require('../models/expense');

router.post('/daily-expense', auth, expController.postDailyExp);
router.get('/daily-expense', auth, expController.getDailyExp);
router.get('/monthly-expense', auth, expController.getMonthlyExp);
router.get('/yearly-expense', auth, expController.getYearlyExp);



