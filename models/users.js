/* const Sequelize = require('sequelize');
const sequelize = require('../util/database')

const Users  = sequelize.define('SignUp',{
    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
    },

    name : {
        type : Sequelize.STRING,
        allowNull : false  
    },

    email : {
        type : Sequelize.STRING,
        allowNull : false,
        unique: true
    },

    passWord: {
        type : Sequelize.STRING,
        allowNull :false
        
    },
    
    isPremiumUser : {
        type : Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Users; */

const mongoose  = require("mongoose");
const Schema = mongoose.Schema;

const userSChema  = new Schema({
    name:{
        type : String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true 
    },
    password:{
        type : String,
        required : true
    },
    isPremiumUser: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('User', userSChema)

