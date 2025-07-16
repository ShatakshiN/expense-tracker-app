const express = require('express');
const sequelize = require('../util/database');
const bcrypt = require('bcrypt');
var Brevo = require('@getbrevo/brevo');
const router= express.Router();
require('dotenv').config();
// Models
const Users = require('../models/users');
const resetPassword  = require('../models/forgot password');

exports.forgotPassword = async(req,res,next){
  try {
        const email = req.body.email;
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, msg: "Email not found" });
        }

        var apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(Brevo.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY);

        const link = await user.createResetPassword();

        let sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "Reset password";
        sendSmtpEmail.htmlContent = `<p>Click the link to reset your password</p><a href="http://localhost:4000/resetpassword.html?reset=${link.id}">click here</a>`;
        sendSmtpEmail.sender = { "name": "Shatakshi", "email": "shatakshinimare27@gmail.com" };
        sendSmtpEmail.to = [{ "email": email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        return res.status(200).json(JSON.stringify(data));
    } catch (e) {
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

exports.resetPassword = async(req,res,next){
  const t = await sequelize.transaction();
    try {
        const { resetId } = req.params;
        const { newPassword, confirmPassword } = req.body;

        const resetUser = await resetPassword.findByPk(resetId);
        if (!resetUser || !resetUser.isActive) {
            return res.status(401).json({ success: false, msg: "Link expired or invalid" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(403).json({ success: false, msg: "New and confirm password are different" });
        }

        const userId = resetUser.SignUpId;
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await Users.update({ passWord: hash }, { where: { id: user.id }, transaction: t });
        await resetUser.update({ isActive: false }, { transaction: t });

        await t.commit();
        return res.json({ success: true, msg: "Password changed successfully" });
    } catch (e) {
        await t.rollback();
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

exports.checkLink = async(req,res,next){
   try {
        const resetUser = await resetPassword.findByPk(req.params.resetId);
        return res.json({ isActive: resetUser.isActive });
    } catch (e) {
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
}
