const express = require('express');
const sequelize = require('../util/database');
const Razorpay = require('razorpay');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const router= express.Router();


require('dotenv').config();

//middleware
const middleware = require('../middleware/auth')

// Models
const Users = require('../models/users');
const Expense = require('../models/expense');
const Order = require('../models/order');
const FileURL = require('../models/fileURL');


router.get('/buy-premium', middleware, async (req, res, next) => {
    const t = await sequelize.transaction(); // Start a transaction

    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amount = 14900;

        const order = await new Promise((resolve, reject) => {
            rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });

        await req.user.createOrder({ orderid: order.id, status: "PENDING" }, { transaction: t });

        await t.commit(); // Commit the transaction

        return res.status(201).json({ order, key_id: rzp.key_id });
    } catch (err) {
        await t.rollback(); // Rollback the transaction if an error occurs
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
});



//update transection.
router.post('/updatetransectionstatus', middleware, async (req, res, next) => {
    const { order_id, payment_id } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            // Find the order within the transaction
            const order = await Order.findOne({ where: { orderid: order_id }, transaction: t });

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Update the order status and user's premium status within the transaction
            await Promise.all([
                order.update({ paymentId: payment_id, status: 'successful' }, { transaction: t }),
                req.user.update({ isPremiumUser: true }, { transaction: t })
            ]);

            // Commit the transaction if all operations are successful
            res.status(202).json({ success: true, message: 'Transaction successful' });
        });
    } catch (err) {
        // Log the error and handle it appropriately
        console.log(err);
        res.status(500).json({ success: false, message: 'Transaction failed' });
    }
});


router.get('/check-premium-status', middleware, async (req, res, next) => {
    try {
        const user = req.user;

        // Check if the user is premium (you may have a field like isPremium in your Users model)
        const isPremium = user.isPremiumUser;

        return res.status(200).json({ isPremium });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error checking premium status', error: err.message });
    }
});

//using left join 
router.get('/premium/LeaderBoard', middleware ,async(req,res,next)=>{
    try{
        const LeaderBoardData = await Users.findAll({
            attributes : ['id', 'name',[sequelize.fn('sum', sequelize.col('expenses.amount')), 'total_cost']],
            include : [
                {
                    model : Expense,
                    attributes : []

                  }
            ],
            group : ['id'],
            order : [['total_cost', 'DESC']]
        })
        res.status(200).json(LeaderBoardData);

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }

});

function uploadToS3(data, fileName){
    const BUCKET_NAME = "exptrackershatakshi";
    const IAM_USER_KEY = process.env.AWS_ACCESS_KEY;
    const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;

    const s3Client = new S3Client({
        region: "ap-south-1", // replace with your bucket's region
        credentials: {
            accessKeyId: IAM_USER_KEY ,
            secretAccessKey:  IAM_USER_SECRET,
        }
    })

    var params={
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject) => {
        s3Client.send(new PutObjectCommand(params))
            .then((data) => {
                const fileURL = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
                console.log("Success", data);
                resolve(fileURL);
            })
            .catch((err) => {
                console.log("Something is Wrong", err);
                reject(err);
            });
    });


}

//downloading expense for each user
router.get('/download-expense',middleware, async(req,res,next)=>{
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
    };
});

router.get('/downloaded-files', middleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const files = await FileURL.findAll({ where: { SignUpId: userId } });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router