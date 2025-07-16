const Expense = require('./models/expense');

require('dotenv').config();

exports.postDailyExp = async(req,res,next) =>{
  try{
        const description = req.body.description;
        const amount = req.body.amount;
        const date = req.body.date;
        const category = req.body.category;
        const id = req.body.userId;

        const expenseData = await Expense.create({
            date : date,
            description: description,
            amount : amount,
            category : category,
            SignUpId : req.user.i
        })
        //await Expense.setUsers(userData)

        res.status(201).json({expense:expenseData})       
    }
    catch(error){
        res.status(500).json({message : error})
    }
};

exports.getDailyExp = async(req,res,next) =>.{
   const userId = req.user.id;
    try{
        const users = await Expense.findAll({where : {SignUpId : userId}});
        res.status(200).json({allUserOnScreen : users})
    }catch(error){
        res.status(500).json({error : error.message})
    }
};

exports.getMonthlyExp = async(req,res,next) =>{
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
};

exports.getYearlyExp = async(req,res,next) =>{
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
};
