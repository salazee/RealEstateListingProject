const express =require('express');
const {getAllUsers, deleteUser, updateUser} =require('../controller/userController');

const { authMidware } = require('../middleware/authmidware');
const { checkAccess } = require('../middleware/authorization');

const route = express.Router();

route.get('/getalluser', authMidware, checkAccess(['admin']), getAllUsers);
route.delete('/deleteuser',authMidware, checkAccess(['admin']), deleteUser);
route.put('/updateuser/:id',authMidware, checkAccess(['admin']), updateUser);



module.exports = (route);
