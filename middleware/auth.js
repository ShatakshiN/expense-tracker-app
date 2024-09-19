const jwt = require('jsonwebtoken');
const Users = require('../models/users');

async function authenticate(req, res, next) {
    try {
        const token = req.header('Authorization');
        console.log(token);

        if (!token) {
            throw new Error('Authorization token missing');
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(user.userId);

        const foundUser = await Users.findByPk(user.userId);
        if (!foundUser) {
            throw new Error('User not found');
        }

        req.user = foundUser;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }
}

module.exports = authenticate;