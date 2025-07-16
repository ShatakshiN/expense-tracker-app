const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
require('dotenv').config();

const middleware = require('../middleware/auth');
const User = require('../models/users');
const Order = require('../models/order');
const Expense = require('../models/expense'); // For leaderboard

exports.buyPremium = async(req,res,next) =>{
  try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amount = 149000;

        const order = await rzp.orders.create({ amount, currency: 'INR' });

        const newOrder = new Order({
            orderId: order.id,
            status: "PENDING",
            user: req.user._id
        });

        await newOrder.save();

        return res.status(201).json({ order, key_id: rzp.key_id });
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
};

exports.updateTransectionStatus = async(req,res,next) =>{
   const { order_id, payment_id } = req.body;

    try {
        const order = await Order.findOne({ orderId: order_id });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.paymentId = payment_id;
        order.status = 'successful';
        await order.save();

        req.user.isPremiumUser = true;
        await req.user.save();

        res.status(202).json({ success: true, message: 'Transaction successful' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Transaction failed' });
    }

};

exports.checkPremium = async(req,res,next){
  try {
        const isPremium = req.user.isPremiumUser;
        return res.status(200).json({ isPremium });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error checking premium status', error: err.message });
    }
});

exports.leaderBoard = async(req, res,next) =>{
  try {
        const leaderboardData = await Expense.aggregate([
            {
                $group: {
                    _id: "$userId",
                    total_cost: { $sum: "$amount" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 0,
                    id: "$userDetails._id",
                    name: "$userDetails.name",
                    total_cost: 1
                }
            },
            {
                $sort: { total_cost: -1 }
            }
        ]);

        res.status(200).json(leaderboardData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to fetch leaderboard", error: err.message });
    }
};
function uploadToS3(data, fileName){
    const BUCKET_NAME = "exptrackershatakshi";
    const IAM_USER_KEY = process.env.AWS_ACCESS_KEY;
    const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;
    const s3Client = new S3Client({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })

    var params={
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject)=>{
        s3bucket.upload(new PutObjectCommand(params),(err,data)=>{
            if(err){
                console.log("Something is Wrong",err);
                reject(err);
            }
            else{
                console.log("Success", data);
                resolve(s3Response.Location);
            }
        })

    })
exports.downloadExp  = async(req,res,next) =>{
  const userId = req.user.id;
    try{
        const name= await req.user.name;
        const random= Math.random();
        const users = await Expense.findAll({where : {SignUpId : userId}});
        console.log(users)
        const stringifiedExpenses = JSON.stringify(users);
        const fileName = `${name}_${random}.txt`;
        const fileURL = await uploadToS3(stringifiedExpenses, fileName);
        console.log(fileURL)
        const data = await FileURL.create({
            url : fileURL,
            SignUpId : userId
        })
        res.status(200).json({fileURL, success:true})


    }catch(error){
        res.status(500).json({error : error.message})
    }

};

exports.downloadedExpFiles = async(req,res,next) =>{
  try {
        const userId = req.user.id;
        const files = await FileURL.findAll({ where: { SignUpId: userId } });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
