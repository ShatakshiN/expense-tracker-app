const http = require('http');
const express = require('express');
const app  = express();
const cors = require('cors');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');


//models
const Users = require('./models/users');
const Expense = require('./models/expense');
const { error } = require('console');


app.use(bodyParser.json());
app.use(cors());

function isStrValid(str){
    if(str == undefined || str.length === 0){
        return true
    }else{
        return false
    }
}

app.post('/signUp', async(req,res,next)=>{
    try{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if (isStrValid(email)|| isStrValid(name) || isStrValid(password) ){
            return res.status(400).json({err : "bad parameter"})

        }

         // Check if the email already exists
        const existingUser = await Users.findOne({
            where: {
                email: email
            }
        });

        if (existingUser) {
            return res.status(400).json({message : "Email already exists"})
        } 

        bcrypt.hash(password, 10, async(error, hash)=>{
            const userData = await Users.create({
                name : name,
                email : email,
                passWord : hash

            })

        })
        return res.status(201).json({msg: "sign up successful"})

       

    }catch(error){
        return res.status(500).json({error : error.message})
    }

});

app.post('/login', async (req, res, next) => {
    try {
        
        const email = req.body.email;
        const password = req.body.password;
       

        if(isStrValid(email) || isStrValid(password)){
            return req.status(400).json({message : "bad parameters"})
        }

        const loginCredentials = await Users.findAll({
            where: { email: email }
        });

        if(loginCredentials.length > 0){
            bcrypt.compare(password, loginCredentials[0].passWord, (err, result )=>{ //the result will be true / false
                if(err){
                    res.status(500).json({msg : "something went wrong"})
                }
                if(result === true){
                    res.status(200).json({msg: "user logged in successfully",id: loginCredentials[0].id })
                }else {
                    return res.status(400).json({ msg: 'password incorrect' });
                }
            })
        }else {
            return res.status(404).json({ msg: "user doesn't exist" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

app.post('/daily-expense', async(req,res,next)=>{

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
            category : category  
                     
        })
        //await Expense.setUsers(userData)

        res.status(201).json({expense:expenseData})       

    }
    catch(error){
        res.status(500),json({message : error})
    }
})
app.get('/daily-expense',async(req,res,next) =>{

    try{
        const users = await Expense.findAll();
        res.status(200).json({allUserOnScreen : users})
    }catch(error){
        res.status(500).json({error : error.message})
    };

});

app.delete('/delete-expense/:userId', async(req,res,next)=>{

    const userId = req.params.userId

    try{
        const user = await Expense.findByPk(userId);
        if (!user){
            throw new Error('userId not found');
        }

        await user.destroy();
        res.status(200).json({error : 'user deleted successfully'})

    }catch(error){

        res.status(500).json({error  : error.message})
       
    }

});
/* 
Expense.belongsTo(Users,{constraints: true, onDelete: 'CASCADE'});
Users.hasMany(Expense); */

sequelize.sync()
    .then(()=>{
        app.listen(4000)
        console.log('server is running on 4000')

    })
    .catch((error)=>{
        console.log(error);
    });