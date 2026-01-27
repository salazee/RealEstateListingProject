// routes/payment.js
const express = require("express");
const { authMidware } = require("../middleware/authmidware");
const { checkAccess } = require("../middleware/authorization");
const {
  payListingFee,
  payInspectionFee,
  boostListing,
  initializePayment,
  verifyPayment,
  paystackWebhook,
  getPaymentHistory,
  retryPayment,
  getAllPayment,
  getRevenueAnalytics
} = require("../controller/paymentController");

const route = express.Router();

// === CREATE PAYMENTS ===
route.post("/listing/:propertyId", authMidware, payListingFee);
route.post("/inspection/:propertyId", authMidware, payInspectionFee);
route.post("/boost/:propertyId", authMidware, boostListing);

// === INITIALIZE PAYMENT (Redirect to Paystack) ===
route.post("/initialize/:paymentId", authMidware, initializePayment);

// === VERIFY PAYMENT (Called from frontend after redirect) ===
route.get("/verify/:reference", verifyPayment); // ✅ NEW - Can be public or authenticated

// === RETRY FAILED PAYMENT ===
route.post("/retry/:paymentId", authMidware, retryPayment);

// === PAYMENT HISTORY ===
route.get("/history", authMidware, getPaymentHistory);
// === ADMIN: GET ALL PAYMENTS ===
route.get("/allpayments", authMidware, checkAccess(['admin']), getAllPayment);

// === ADMIN: REVENUE ANALYTICS ===
route.get("/analytics", authMidware, checkAccess(['admin']), getRevenueAnalytics);

// === PAYSTACK WEBHOOK (Must be public - no auth) ===
route.post("/webhook", paystackWebhook);

module.exports = route;