const http = require('http');
const express = require('express');
const fs = require('fs');
const nativePath = require('path');
const app  = express();
const cors = require('cors');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');

require('dotenv').config();

//routes
const loginAndSignUpRoute = require('./route/loginAndSignUp');
const expenseRoute = require('./route/expense');
const delRoute = require('./route/del');
const premiumRoute = require('./route/premium');
const forgotPasswordRoute = require('./route/forgotPassword');

// Models
const Users = require('./models/users');
const Expense = require('./models/expense');
const Order = require('./models/order');
const resetPassword  = require('./models/forgot password');
const FileURL = require('./models/fileURL');



// append access history in access.log
/* const accessLogStream = fs.createWriteStream(nativePath.join(__dirname, 'access.log'), { flag: 'a' }); */

app.use(bodyParser.json()); //specifically parse json formatted req bodies
app.use(cors());

//routes
app.use(loginAndSignUpRoute);
app.use(expenseRoute);
app.use(delRoute);
app.use(premiumRoute);
app.use(forgotPasswordRoute);


app.use(express.static('views'));
app.use(express.static('views/public'));

// Associations
Expense.belongsTo(Users, { constraints: true, onDelete: 'CASCADE' });
Users.hasMany(Expense);

Order.belongsTo(Users, { constraints: true, onDelete: 'CASCADE' });
Users.hasMany(Order);

Users.hasMany(resetPassword);
resetPassword.belongsTo(Users, { constraints: true, onDelete: 'CASCADE' });

Users.hasMany(FileURL);
FileURL.belongsTo(Users, { constraints: true, onDelete: 'CASCADE' });

sequelize.sync()
    .then(()=>{
        app.listen(process.env.PORT || 4000)
        console.log('server is running on 4000')

    })
    .catch((error)=>{
        console.log(error);
    });
