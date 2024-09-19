// reset password functionality

const http = require('http');
const express = require('express');
const fs = require('fs');
const nativePath = require('path')
const customPath = require('./util/customPath')
const app  = express();
const cors = require('cors');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');


const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

//const Brevo = require('@getbrevo/brevo');
var Brevo = require('@getbrevo/brevo');

require('dotenv').config();


//models
const Users = require('./models/users');
const Expense = require('./models/expense');
const Order = require('./models/order');
const resetPassword  = require('./models/forgot password');
const FileURL = require('./models/fileURL');
const { error, group } = require('console');
const { where } = require('sequelize');
const { Stream } = require('stream');


const accessLogStream = fs.createWriteStream(nativePath.join(__dirname, 'access.log'),{flag :'a'});

app.use(bodyParser.json());


app.use(cors());


function isStrValid(str){
    if(str == undefined || str.length === 0){
        return true
    }else{
        return false
    }
}

//app.get('/favicon.ico', (req, res) => res.status(204));


app.post('/signUp', async(req,res,next)=>{
    try{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        console.log('backend' , { name, email, password });

        if (isStrValid(email)|| isStrValid(name) || isStrValid(password) ){
            return res.status(400).json({err : "bad parameter"})

        }

         // Check if the email already exists
        const existingUser = await Users.findOne({
            where: {
                email: email,
            }
        });

        if (existingUser) {
            return res.status(400).json({message : "user already exists"})
        } 

        bcrypt.hash(password, 10, async(error, hash)=>{
            const userData = await Users.create({
                name : name,
                email : email,
                passWord : hash,
             

            })

        })
        return res.status(201).json({msg: "sign up successful"})

       

    }catch(error){
        return res.status(500).json({error : error.message})
    }

});

function generateAccessToken(id){
    return jwt.sign({userId: id }, 'secret key')
}

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
                    res.status(200).json({msg: "user logged in successfully", token: generateAccessToken(loginCredentials[0].id) })
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

async function authenticate(req,res,next) {
    try {
        const token = req.header('Authorization');
        console.log(token);
        
        if (!token) {
            throw new Error('Authorization token missing');
        }
        
        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(user.userId);

        const foundUser = await Users.findByPk(user.userId); // Wait for the user lookup
        if (!foundUser) {
            throw new Error('User not found'); // Handle if user is not found
        }

        console.log(JSON.stringify(foundUser));
        req.user = foundUser; // Assign the user to the request for global use
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }

} 



app.post('/daily-expense', authenticate, async(req,res,next)=>{

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
            SignUpId : req.user.id

                     
        })
        //await Expense.setUsers(userData)

        res.status(201).json({expense:expenseData})       

    }
    catch(error){
        res.status(500).json({message : error})
    }
})


app.get('/daily-expense',authenticate,async(req,res,next) =>{
    const userId = req.user.id;
    try{
        const users = await Expense.findAll({where : {SignUpId : userId}});
        res.status(200).json({allUserOnScreen : users})
    }catch(error){
        res.status(500).json({error : error.message})
    };

});



app.delete('/delete-expense/:expenseId', authenticate, async (req, res, next) => {
    try {
        const expenseId = req.params.expenseId;
        const userId = req.user.id;

        // Find the expense to be deleted
        const expenseToDelete = await Expense.findOne({
            where: {
                id: expenseId,
                SignUpId: userId
            }
        });

        if (!expenseToDelete) {
            return res.status(404).json({ message: "Expense not found" });
        }

        // Delete the expense
        await expenseToDelete.destroy();

        return res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete expense", error: error.message });
    }
});

app.post('/forgotPassword' , async(req,res,next)=>{
    try{
        const email = req.body.email;
        console.log(email);
        const user = await Users.findOne({where : {email : email}},{
            include : [
                {model : resetPassword}
            ]
        })
        console.log(user)
        console.log(user== null)
        if(user === null)
             return res.status(404).json({success : false , msg :"Email not found"})

        
        var apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(Brevo.AccountApiApiKeys.apiKey,process.env.BREVO_API_KEY);
        
        const link = await user.createResetPassword();

        let sendSmtpEmail = new Brevo.SendSmtpEmail(); 
        sendSmtpEmail.subject = "reset password";
        sendSmtpEmail.htmlContent = '<p>Click the link to reset your password</p>'+
        `<a href="http://localhost:4000/reset password.html?reset=${link.id}">click here</a>`;
        sendSmtpEmail.sender = {"name":"Shatakshi","email":"shatakshinimare27@gmail.com"};
        sendSmtpEmail.to = [{"email": email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        return res.status(200).json(JSON.stringify(data));

    }catch(e){
        console.log(e)
        return res.status(500).json({success : false ,msg :"Internal server error"})
    }
        
});

app.post('/reset-password/:resetId' , async(req,res)=>{
    const t = await sequelize.transaction()
    try{
        const resetId = req.params.resetId;
        const newPassword = req.body.newPassword
        const confirmPassword = req.body.confirmPassword

        const resetUser = await resetPassword.findByPk(resetId)
        if (!resetUser) {
            return res.status(404).json({ success: false, msg: "User not found" });
    }
        if(!resetUser.isActive){
            return res.status(401).json({success : false , msg:"link expired create a new one"})
        }
        if(newPassword !== confirmPassword)
        return res.status(403).json({success : false , msg:"new and confirm password are different"})
    
    //const user = await resetUser.getUser() //error here 
    const userId = resetUser.SignUpId; // Assuming the foreign key is stored as SignUpId
    const user = await Users.findByPk(userId);
    if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
    }
    const hash = await bcrypt.hash(newPassword,10)

    await Users.update({password : hash},{ where: { id: user.id }},{transaction :t})
    await resetUser.update({isActive : false},{transaction : t})

    await t.commit()

    return res.json({success : true , msg:"Password changed successfully"})
    }catch(e){
        console.log(e)
        await t.rollback()
        return res.status(500).json({success : false , msg : "Internal server error"})
    }
})

app.get('/check-password-link/:resetId', async(req,res)=>{
    try{
        const resetUser = await resetPassword.findByPk(req.params.resetId)
        return res.json({isActive : resetUser.isActive})
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg : "Internal server error"})
    }
})

Expense.belongsTo(Users,{constraints: true, onDelete: 'CASCADE'});
Users.hasMany(Expense);

Order.belongsTo(Users, {constraints: true, onDelete: 'CASCADE'});
Users.hasMany(Order); 

Users.hasMany(resetPassword)
resetPassword.belongsTo(Users,{constraints: true, onDelete: 'CASCADE'});

FileURL.belongsTo(Users, {constraints: true, onDelete: 'CASCADE'});
Users.hasMany(FileURL);

sequelize.sync()
    .then(()=>{
        app.listen(process.env.PORT || 4000)
        console.log('server is running on 4000')

    })
    .catch((error)=>{
        console.log(error);
    });

