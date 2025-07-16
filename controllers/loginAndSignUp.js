const Users = require('./models/users');
const express = require('express');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router= express.Router();

require('dotenv').config();



function isStrValid(str){
    if(str == undefined || str.length === 0){
        return true
    }else{
        return false
    }
};

exports.signUp = async(req,res,next) =>{
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
};

function generateAccessToken(id){
    return jwt.sign({userId: id }, 'secret key')
};

exports.login = async(req,res,next) =>{
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
};
