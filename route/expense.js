const express = require('express');
const sequelize = require('../util/database');
const router= express.Router();

require('dotenv').config();

//middleware
const middleware = require('../middleware/auth');

// Models
const Expense = require('../models/expense');


router.post('/daily-expense', middleware, async (req, res, next) => {
    try {
        const { description, amount, date, category } = req.body;

        const expenseData = await Expense.create({
            date,
            description,
            amount,
            category,
            SignUpId: req.user.id
        });

        res.status(201).json({ expense: expenseData });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

router.get('/daily-expense', middleware, async (req, res, next) => {
    try {
        const users = await Expense.findAll({ where: { SignUpId: req.user.id } });
        res.status(200).json({ allUserOnScreen: users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//monthly 
router.get('/monthly-expense', middleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const monthlyExpenses = await Expense.findAll({
            where: { SignUpId: userId },
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y-%m'), 'month'],  // Group by year-month
                [sequelize.fn('sum', sequelize.col('amount')), 'totalExpense']
            ],
            group: 'month',
            order: [['month', 'ASC']]
        });
        res.status(200).json({ monthlyExpenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//yearly expense 
router.get('/yearly-expense', middleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const yearlyExpenses = await Expense.findAll({
            where: { SignUpId: userId },
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y'), 'year'],  // Group by year
                [sequelize.fn('sum', sequelize.col('amount')), 'totalExpense']
            ],
            group: 'year',
            order: [['year', 'ASC']]
        });
        res.status(200).json({ yearlyExpenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
