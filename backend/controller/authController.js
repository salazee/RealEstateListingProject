const User = require("../model/auth");
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail =require('../service/nodemailer');
const jwt = require("jsonwebtoken");


dotenv.config();

 const JWT_SECRET = process.env.JWT_SECRET;

const Register = async(req,res) =>{
    try {
        const {name,email,password,role}= req.body;

        if (!name||!email||!password||!role){
            return res.status(401).send({message:"Invalid Parameters"})}

//check for existing user
 const existing = await User.findOne({ email });

    if (existing) {
    return res.status(409).send({message:'Email already registered.'})   
    }

    // //compare password
    // const validatePassword = await bcrypt.compare(password, data.password);
    // if (!validatePassword) {
    //  return res.status(400).send("Incorrect Password");
    // }

//otp logic
    const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString(); // Fixed range: 6-digit (10000–99999)


       const otp = generateOtp();
         console.log("This is your OTP: ",otp);
         
  const salt =await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);

            const newUser = new User({
                name:name,
                email:email,
                password:hashPassword,
                role:role,
                otp,
                isVerified:false,
                otpExpires: new Date(Date.now() + 10 * 60 * 1000) 
            })
           await newUser.save(); 

           
    // Send OTP email
    await sendEmail.sendMail(
      newUser.email,
      "Verify Your Email - OTP",
      `<h1><b>Welcome to Our Platform, ${newUser.name}!</b></h1>
       <p>Thank you for registering!</p>
       <h2>Your OTP: <strong>${otp}</strong></h2>
       <p>Enter this code on the verification page to activate your account.</p>
       <p><em>Do not share this OTP with anyone.</em></p>`
    );
  return res.status(200).json({message:" User Created successfully", user:{id:newUser.id,
     name:newUser.name,
      email:newUser.email, role:newUser.role} });
    } catch (error) {
        console.error("Error Creating User:", error);
         res.status(500).send({
            message: "Internal Server Error",
            error: error.message
    }
)}
}

const VerifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Update user status
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const ResendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const generateOtp = () =>
      Math.floor(10000 + Math.random() * 90000).toString();

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // resend email
    await sendEmail.sendMail(
      user.email,
      "New Verification OTP",
      `<h2>Your new OTP: <strong>${otp}</strong></h2>`
    );

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail.sendMail({
    to: user.email,
    subject: 'Reset your password',
    text: `Click here to reset your password: ${resetUrl}`,
  });

  res.json({ message: 'Password reset link sent' });
};

const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: 'Token invalid or expired' });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  // user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({ message: 'Password reset successful' });
};


const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email first" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const Logout = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Logged out successfully. Please delete token on client."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





module.exports={Register, VerifyEmail, ResendOtp, forgotPassword, resetPassword, Login, Logout} 