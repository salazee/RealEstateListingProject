//controller/adminController.js
const User =require("../model/auth");
const bcrypt = require('bcrypt');
const sendEmail = require('../service/nodemailer');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const createAdmin =async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email, and password'
        });
      }
      // Check if requester is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create other admins" });
      }
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Admin with this email already exists'
        });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create admin user
      const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true, // Admins are auto-verified
        isActive
      });
      await newAdmin.save();    

      // Send welcome email to new admin  
      await sendEmail.sendMail(
        newAdmin.email,
        "Admin Account Created",
        `<h1>Welcome to the Admin Team, ${newAdmin.name}!</h1>
        p>Your admin account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${password}</p> 
        <p><em>Please change your password after first login.</em></p>
        <p>Login at: ${process.env.FRONTEND_URL}/admin/login</p>`
      );  
  
      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
  
    } catch (error) {
      console.error('Create admin error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error creating admin',
        error: error.message
      });
    }
  };

//get all Admins 
const getAllAdmins = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Only admins can access this resource" });
    }
    const admins = await User.find({ role: 'admin' }).select('-password -otp -otpExpires  -resetPasswordToken -resetPasswordExpires')
    .sort({ createdAt: -1 }); // Sort by creation date descending

    return res.status(200).json({
      success: true,
      admins
    }); 
  } catch (error) {
    console.error("Get all admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching admins",
      error: error.message
    });
  }

};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    // Check if requester is super admin
    if (req.user.role !== 'superadmin') { 
      return res.status(403).json({ message: "Only super admins can delete admins" });
    }
    if(req.user.id === adminId){
      return res.status(400).json({ message: "You cannot delete yourself" });
    }
    const admin = await User.findByIdAndDelete(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (admin.role !== 'admin') {
      return res.status(400).json({ message: "The specified user is not an admin" }); 
    }
    await User.findByIdAndDelete(adminId);

    return res.status(200).json({
      message: "Admin deleted successfully"
  });
  } catch (error) { 
    console.error("Delete admin error:", error);
    return res.status(500).json({
      message: "Server error deleting admin",
      error: error.message
    });
  }
};

// ✅ Promote User to Admin (Super Admin Only)
const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: "User is already an admin" });
    }

    // Promote to admin
    user.role = 'admin';
    user.isVerified = true; // Auto-verify admins
    await user.save();

    // Send notification email
    await sendEmail.sendMail(
      user.email,
      "You've Been Promoted to Admin",
      `<h1>Congratulations, ${user.name}!</h1>
       <p>You have been promoted to Admin.</p>
       <p>You can now access the admin dashboard at:</p>
       <p>${process.env.FRONTEND_URL}/admin/login</p>`
    );

    return res.status(200).json({
      message: "User promoted to admin successfully",
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error promoting user:", error);
    return res.status(500).json({ 
      message: "Failed to promote user", 
      error: error.message 
    });
  } 
};
  // ✅ Demote Admin to User

  const demoteAdmin = async (req, res) => {
    try {
      const { adminId } = req.params;
      const { newRole } = req.body; // 'buyer' or 'seller'
  
      // Check if requester is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
  
      // Prevent demoting yourself
      if (req.user.id === adminId) {
        return res.status(400).json({ message: "You cannot demote yourself" });
      }
  
      if (!['buyer', 'seller'].includes(newRole)) {
        return res.status(400).json({ message: "New role must be 'buyer' or 'seller'" });
      }
  
      const admin = await User.findById(adminId);
  
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      if (admin.role !== 'admin') {
        return res.status(400).json({ message: "User is not an admin" });
      }
  
      // Demote to regular user
      admin.role = newRole;
      await admin.save();
  
      // Send notification email
      await sendEmail.sendMail(
        admin.email,
        "Role Change Notification",
        `<h2>Hello ${admin.name},</h2>
         <p>Your role has been changed from Admin to ${newRole}.</p>
         <p>You can now login at the regular user portal.</p>`
      );
  
      return res.status(200).json({
        message: "Admin demoted successfully",
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
  
    } catch (error) {
      console.error("Error demoting admin:", error);
      return res.status(500).json({ 
        message: "Failed to demote admin", 
        error: error.message 
      });
    }
  ;

module.exports = {
    createAdmin,
    getAllAdmins,
    deleteAdmin,
    promoteToAdmin,
    demoteAdmin
};