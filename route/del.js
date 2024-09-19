const express = require('express');
const router= express.Router();

require('dotenv').config();

//middleware
const middleware = require('../middleware/auth');

// Models
const Expense = require('../models/expense');


router.delete('/delete-expense/:expenseId', middleware, async (req, res, next) => {
    try {
        const expenseId = req.params.expenseId;

        const expenseToDelete = await Expense.findOne({
            where: {
                id: expenseId,
                SignUpId: req.user.id
            }
        });

        if (!expenseToDelete) {
            return res.status(404).json({ message: "Expense not found" });
        }

        await expenseToDelete.destroy();
        return res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete expense", error: error.message });
    }
});

module.exports =router;