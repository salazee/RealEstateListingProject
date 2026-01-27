// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../model/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMidware} = require('../middleware/authmiddleware');
const {checkAccess} = require('../middleware/authorization');

// ✅ SUPER ADMIN ONLY - Create New Admin
// Should be protected by a super admin role or secret key
router.post('/create-admin', authMidware, checkAccess,createAdmin);

// ✅ Get All Admins (Admin Only)
router.get('/all-admins', authMidware, checkAccess,getAdmin) ;

module.exports = router;