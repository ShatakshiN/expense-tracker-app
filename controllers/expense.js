const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

//middleware
const middleware = require('../middleware/auth');

// Models
const Expense = require('../models/expense');

exports.postDailyExp = async(req, res,next)=>{
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
};

exports.getDailyExp = async(req,res,next)=>{
  try {
        const expenses = await Expense.find({ userId: req.user.id }); 
        res.status(200).json({ allUserOnScreen: expenses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMonthlyExp = async(req,res,next)=>{
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
};

exports.getYearlyExp = async(req,res,next){
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
};
