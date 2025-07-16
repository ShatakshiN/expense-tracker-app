const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

require('dotenv').config();

//middleware
const middleware = require('../middleware/auth');

// Models
const Expense = require('../models/expense');


router.post('/daily-expense', middleware, async (req, res) => {
    try {
        const { description, amount, date, category } = req.body;

        const expenseData = await Expense.create({
            date,
            description,
            amount,
            category,
            userId: req.user.id 
        });

        res.status(201).json({ expense: expenseData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/daily-expense', middleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }); 
        res.status(200).json({ allUserOnScreen: expenses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/monthly-expense', middleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const monthlyExpenses = await Expense.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    totalExpense: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ monthlyExpenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.get('/yearly-expense', middleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const yearlyExpenses = await Expense.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y", date: "$date" } },
                    totalExpense: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ yearlyExpenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;

