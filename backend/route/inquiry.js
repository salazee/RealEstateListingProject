const express = require('express');
const {createInquiry,respondToInquiry , getSingleInquiry,getSellerInquiries,getBuyerInquiries, getAllInquiries}  =require('../controller/inquiryController');
const {authMidware} =require('../middleware/authmidware');
const {checkAccess} = require('../middleware/authorization');

const route =express.Router();

route.post('/createinquiry', authMidware, createInquiry);
route.post('/response/:id', authMidware,checkAccess(['seller','admin']), respondToInquiry);
route.get('/getInquiry/:id', authMidware,checkAccess(['seller','admin']), getSingleInquiry);
route.get('/sellerinquiries', authMidware,checkAccess(['seller','admin']), getSellerInquiries);
route.get('/my-inquiries', authMidware,checkAccess(['buyer','admin']), getBuyerInquiries);
route.get('/allinquiries', authMidware,checkAccess(['admin']) ,getAllInquiries);

module.exports = route;