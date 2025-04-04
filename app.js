const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
const auth = require('./middleware/auth')
app.use(express.json());
app.use(cors());

//routes
const userRoute = require('./route/loginAndSignUp')

app.use(userRoute)


// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_LINK)
    .then(() => {
        app.listen(4000, () => {
            console.log('Server running');
        });
    })
    .catch(err => {
        console.error('MongoDB connection failed:', err.message);
    });
