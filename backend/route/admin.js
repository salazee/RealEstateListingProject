// backend/routes/adminRoutes.js
const express = require('express');
const route = express.Router();
const {createAdmin, getAllAdmins,deleteAdmin,promoteAdmin,demoteAdmin} = require('../controllers/adminController');,
const { authMidware} = require('../middleware/authmiddleware');
const {checkAccess} = require('../middleware/authorization');

route.post('/createadmin',authMidware,checkAccess(['admin']),createAdmin);

route.get('/alladmins',authMidware,checkAccess(['admin']),getAllAdmins);

route.delete('/deleteadmin/:id',authMidware,checkAccess(['admin']),deleteAdmin);

route.patch('/promoteadmin/:userId',authMidware,checkAccess(['admin']),promoteAdmin);

route.put('/demoteadmin/:adminId',authMidware,checkAccess(['admin']),demoteAdmin);

module.exports = route;