const route = require("express").Router();

const { buyerDashboard, sellerDashboard, adminDashboard , getAnalytics} = require("../controller/dashboardController");
const { authMidware } = require("../middleware/authmidware");
const { checkAccess } = require("../middleware/authorization");

console.log('Dashboard routes loaded');

// Buyer
route.get("/buyer", authMidware, buyerDashboard);

// Seller
route.get("/seller", authMidware, sellerDashboard);

// Admin
route.get("/admin", authMidware, adminDashboard);

//Analytics
route.get('/analytics', authMidware, checkAccess(['admin']), getAnalytics);

module.exports = route;
