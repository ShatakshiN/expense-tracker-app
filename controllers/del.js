const express = require('express');
require('dotenv').config();
// Middleware
const middleware = require('../middleware/auth');

// Mongoose Expense model
const Expense = require('../models/expense');

exports.delete = async(req,res,next) =>{
  try {
        const expenseId = req.params.expenseId;

        // Find the expense by ID and userId
        const expenseToDelete = await Expense.findOne({
            _id: expenseId,
            userId: req.user.id
        });

        if (!expenseToDelete) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Delete the expense
        await Expense.deleteOne({ _id: expenseId });

        return res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete expense", error: error.message });
    }
};

