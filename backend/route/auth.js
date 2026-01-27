const express = require("express");
const {Register,Login,Logout, VerifyEmail, ResendOtp,forgotPassword,resetPassword} = require("../controller/authController");
// const authMidware = require("../middleware/authmidware")

const route = express.Router();

route.post('/register', Register);
route.post('/verifyemail', VerifyEmail);
route.post('/resend',ResendOtp);
route.post('/forgotpassword', forgotPassword);
route.post('/resetpassword/:token', resetPassword);
route.post('/login', Login);
route.post('/logout', Logout)

module.exports = route;