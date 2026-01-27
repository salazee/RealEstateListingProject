// controller/paymentController.js
const Payment = require("../model/payment");
const House = require("../model/house");
const User = require("../model/auth");
const crypto = require("crypto");
const axios = require("axios");
const { sendPaymentSuccessEmail, sendPaymentFailedEmail } = require("../service/emailService");
const { notifyUser } = require("../service/notification");

// Boost pricing configuration
const BOOST_PRICES = {
  7: 5000,   // ₦5,000 for 7 days
  14: 9000,  // ₦9,000 for 14 days
  30: 15000  // ₦15,000 for 30 days
};

// === INITIALIZE PAYMENT ===
const initializePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate("user", "name email")
      .populate("property", "name location");

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: "Payment not found" 
      });
    }

    // Check if payment is already successful
    if (payment.status === "success") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed"
      });
    }

    // Generate unique reference if not exists
    if (!payment.reference) {
      payment.reference = `PAY_${Date.now()}_${payment._id}`;
      await payment.save();
    }

    // Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: payment.user.email,
        amount: payment.amount * 100, // Convert to kobo
        reference: payment.reference,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
        metadata: {
          paymentId: payment._id.toString(),
          type: payment.type,
          propertyId: payment.property?._id.toString(),
          userId: payment.user._id.toString(),
          userName: payment.user.name,
          propertyName: payment.property?.name || 'N/A'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Update payment with Paystack access code
    payment.paystackAccessCode = response.data.data.access_code;
    await payment.save();

    res.json({
      success: true,
      message: "Payment initialized successfully",
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: payment.reference
    });

  } catch (error) {
    console.error("Payment initialization error:", error);

  }
};

// // === VERIFY PAYMENT ===
// const verifyPayment = async (req, res) => {
//   try {
//     const { reference } = req.params;

//     if (!reference) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment reference is required"
//       });
//     }

//     // Find payment by reference
//     const payment = await Payment.findOne({ reference })
//       .populate("user", "name email")
//       .populate("property", "name location owner");

//     if (!payment) {
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found"
//       });
//     }

//     // If already verified, return cached result
//     if (payment.status === "success") {
//       return res.json({
//         success: true,
//         message: "Payment already verified",
//         payment: {
//           id: payment._id,
//           reference: payment.reference,
//           amount: payment.amount,
//           type: payment.type,
//           status: payment.status,
//           paidAt: payment.paidAt
//         }
//       });
//     }

//     // Verify with Paystack
//     const response = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
//         }
//       }
//     );

//     const { data } = response.data;

//     if (data.status === "success") {
//       // Update payment status
//       payment.status = "success";
//       payment.paidAt = new Date();
//       payment.paystackResponse = data;
//       await payment.save();

//       // Apply payment effects
//       await applyPaymentEffects(payment);

//       // Send success email
//       await sendPaymentSuccessEmail(payment.user.email, {
//         userName: payment.user.name,
//         type: payment.type,
//         amount: payment.amount,
//         reference: payment.reference,
//         propertyName: payment.property?.name || 'N/A'
//       });

//       // Notify user
//       await notifyUser(
//         payment.user._id,
//         "Payment Successful",
//         `Your ${payment.type} payment of ₦${payment.amount.toLocaleString()} was successful`
//       );

//       return res.json({
//         success: true,
//         message: "Payment verified successfully",
//         payment: {
//           id: payment._id,
//           reference: payment.reference,
//           amount: payment.amount,
//           type: payment.type,
//           status: payment.status,
//           paidAt: payment.paidAt
//         }
//       });

//     } else {
//       // Payment failed
//       payment.status = "failed";
//       payment.failureReason = data.gateway_response || "Payment unsuccessful";
//       await payment.save();

//       // Send failure email
//       await sendPaymentFailedEmail(payment.user.email, {
//         userName: payment.user.name,
//         type: payment.type,
//         amount: payment.amount,
//         reference: payment.reference,
//         reason: payment.failureReason
//       });

//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed",
//         reason: payment.failureReason
//       });
//     }

//   } catch (error) {
//     console.error("Payment verification error:", error);
    
//     res.status(500).json({
//       success: false,
//       message: "Failed to verify payment",
//       error: error.response?.data?.message || error.message
//     });
//   }
// };


// Update verifyPayment in paymentController.js
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required"
      });
    }

    // Find payment by reference
    const payment = await Payment.findOne({ reference })
      .populate("user", "name email")
      .populate("property", "title location owner");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // ✅ If already verified, return success immediately
    if (payment.status === "success") {
      return res.json({
        success: true,
        message: "Payment already verified",
        payment: {
          id: payment._id,
          reference: payment.reference,
          amount: payment.amount,
          type: payment.type,
          status: payment.status,
          paidAt: payment.paidAt
        }
      });
    }

    // ✅ Only verify with Paystack if not already successful
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      const { data } = response.data;

      if (data.status === "success") {
        // ✅ Update payment status
        payment.status = "success";
        payment.paidAt = new Date();
        payment.paystackResponse = data;
        await payment.save();

        // ✅ Apply payment effects
        await applyPaymentEffects(payment);

        // Send success email
        await sendPaymentSuccessEmail(payment.user.email, {
          userName: payment.user.name,
          type: payment.type,
          amount: payment.amount,
          reference: payment.reference,
          propertyName: payment.property?.title || 'N/A'
        });

        // Notify user
        await notifyUser(
          payment.user._id,
          "Payment Successful",
          `Your ${payment.type} payment of ₦${payment.amount.toLocaleString()} was successful`
        );

        return res.json({
          success: true,
          message: "Payment verified successfully",
          payment: {
            id: payment._id,
            reference: payment.reference,
            amount: payment.amount,
            type: payment.type,
            status: payment.status,
            paidAt: payment.paidAt
          }
        });

      } else {
        // Payment failed
        payment.status = "failed";
        payment.failureReason = data.gateway_response || "Payment unsuccessful";
        await payment.save();

        // Send failure email
        await sendPaymentFailedEmail(payment.user.email, {
          userName: payment.user.name,
          type: payment.type,
          amount: payment.amount,
          reference: payment.reference,
          reason: payment.failureReason
        });

        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
          reason: payment.failureReason
        });
      }
    } catch (paystackError) {
      console.error("Paystack verification error:", paystackError);
      
      // ✅ If Paystack returns error, mark as failed
      payment.status = "failed";
      payment.failureReason = paystackError.response?.data?.message || "Verification failed";
      await payment.save();
      
      return res.status(500).json({
        success: false,
        message: "Payment verification failed",
        error: payment.failureReason
      });
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message
    });
  }
};

// === APPLY PAYMENT EFFECTS ===
const applyPaymentEffects = async (payment) => {
  try {
    if (payment.type === "boost" && payment.property) {
      const featuredUntil = new Date(
        Date.now() + (payment.boostDays || 7) * 24 * 60 * 60 * 1000
      );

      await House.findByIdAndUpdate(payment.property._id, {
        isFeatured: true,
        featuredUntil
      });

      console.log(`Property ${payment.property._id} boosted for ${payment.boostDays} days`);
    }

    if (payment.type === "listing" && payment.property) {
      await House.findByIdAndUpdate(payment.property._id, {
        isVerified: true
      });

      console.log(`Property ${payment.property._id} verified`);
    }

    if (payment.type === "inspection" && payment.property) {
      await House.findByIdAndUpdate(payment.property._id, {
        inspectionBooked: true,
        inspectionBookedAt: new Date()
      });

      console.log(`Inspection booked for property ${payment.property._id}`);
    }
    // ✅ Send success email (non-critical - don't fail verification if it errors)
    try {
      if (typeof sendPaymentSuccessEmail === 'function') {
        await sendPaymentSuccessEmail(payment.user.email, {
          userName: payment.user.name,
          type: payment.type,
          amount: payment.amount,
          reference: payment.reference,
          propertyName: payment.property?.title || 'N/A'
        });
      }
    } catch (emailError) {  
      console.error("Error sending payment success email:", emailError);
    }

    // ✅ Notify user (non-critical - don't fail verification if it errors)
    try {
      if (typeof notifyUser === 'function') {
        await notifyUser(
          payment.user._id,
          "Payment Successful",
          `Your ${payment.type} payment of ₦${payment.amount.toLocaleString()} was successful`
        );
      }
    } catch (notifError) {
      console.error('Notification error (non-critical):', notifError);
    }
    
    return res.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment._id,
        reference: payment.reference,
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        paidAt: payment.paidAt
      }
    });
  } catch (error) {
    console.error("Error applying payment effects:", error);
  }
};

// === PAYSTACK WEBHOOK ===
const paystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("Invalid webhook signature");
      return res.sendStatus(401);
    }

    const event = req.body;

    // Handle charge.success event
    if (event.event === "charge.success") {
      const reference = event.data.reference;

      const payment = await Payment.findOneAndUpdate(
        { reference },
        { 
          status: "success", 
          paidAt: new Date(),
          paystackResponse: event.data
        },
        { new: true }
      ).populate("user", "name email")
       .populate("property", "name location");

      if (payment) {
        // Apply payment effects
        await applyPaymentEffects(payment);

        // Send success email
        await sendPaymentSuccessEmail(payment.user.email, {
          userName: payment.user.name,
          type: payment.type,
          amount: payment.amount,
          reference: payment.reference,
          propertyName: payment.property?.name || 'N/A'
        });

        // Notify user
        await notifyUser(
          payment.user._id,
          "Payment Successful",
          `Your ${payment.type} payment was confirmed`
        );
      }
    }

    // Handle failed payment
    if (event.event === "charge.failed") {
      const reference = event.data.reference;

      const payment = await Payment.findOneAndUpdate(
        { reference },
        { 
          status: "failed",
          failureReason: event.data.gateway_response || "Payment failed"
        },
        { new: true }
      ).populate("user", "name email");

      if (payment) {
        // Send failure email
        await sendPaymentFailedEmail(payment.user.email, {
          userName: payment.user.name,
          type: payment.type,
          amount: payment.amount,
          reference: payment.reference,
          reason: payment.failureReason
        });
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};

// === CREATE LISTING FEE PAYMENT ===
const payListingFee = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await House.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Check if user owns the property
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pay for this property"
      });
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({
      property: propertyId,
      type: "listing",
      status: "success"
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Listing fee already paid"
      });
    }

    const payment = await Payment.create({
      user: req.user.id,
      property: propertyId,
      type: "listing",
      amount: 5000,
      status: "pending",
      reference: `LISTING_${Date.now()}_${propertyId}`
    });

    res.json({
      success: true,
      message: "Listing payment initialized",
      paymentId: payment._id,
      amount: payment.amount
    });

  } catch (error) {
    console.error("Listing payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// === CREATE INSPECTION FEE PAYMENT ===
const payInspectionFee = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await House.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const payment = await Payment.create({
      user: req.user.id,
      property: propertyId,
      type: "inspection",
      amount: 3000,
      status: "pending",
      reference: `INSPECT_${Date.now()}_${propertyId}`
    });

    res.json({
      success: true,
      message: "Inspection payment initialized",
      paymentId: payment._id,
      amount: payment.amount
    });

  } catch (error) {
    console.error("Inspection payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// === CREATE BOOST PAYMENT ===
const boostListing = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { days } = req.body;

    if (!days || !BOOST_PRICES[days]) {
      return res.status(400).json({
        success: false,
        message: "Invalid boost duration. Choose 7, 14, or 30 days"
      });
    }

    const property = await House.findById(propertyId).populate("owner");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // ✅ Check if owner exists
    if (!property.owner) {
      return res.status(400).json({
        success: false,
        message: "Property has no owner"
      });
    }
    // Check ownership

    const ownerId = property.owner._id ? property.owner._id.toString() : property.owner.toString();

    if(ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to boost this property"
      });
    }

    const payment = await Payment.create({
      user: req.user.id,
      property: propertyId,
      type: "boost",
      amount: BOOST_PRICES[days],
      boostDays: days,
      status: "pending",
      reference: `BOOST_${Date.now()}_${propertyId}`
    });

    res.json({
      success: true,
      message: "Boost payment initialized",
      paymentId: payment._id,
      amount: payment.amount,
      days
    });

  } catch (error) {
    console.error("Boost payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// === GET PAYMENT HISTORY ===
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate("property", "name location images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// === RETRY FAILED PAYMENT ===
const retryPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Check ownership
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // Only retry failed or pending payments
    if (payment.status === "success") {
      return res.status(400).json({
        success: false,
        message: "Payment already successful"
      });
    }

    // Reset payment status
    payment.status = "pending";
    payment.failureReason = null;
    payment.reference = `RETRY_${Date.now()}_${payment._id}`;
    await payment.save();

    res.json({
      success: true,
      message: "Payment retry initialized",
      paymentId: payment._id
    });

  } catch (error) {
    console.error("Retry payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// === ADMIN: GET ALL PAYMENTS ===
const getAllPayment = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("user", "name email")
        .populate("property", "name location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// === ADMIN: GET REVENUE ANALYTICS ===
const getRevenueAnalytics = async (req, res) => {
  try {
    const [
      totalRevenue,
      successfulPayments,
      failedPayments,
      pendingPayments,
      revenueByType,
      recentPayments
    ] = await Promise.all([
      // Total revenue
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      // Successful payments count
      Payment.countDocuments({ status: "success" }),

      // Failed payments count
      Payment.countDocuments({ status: "failed" }),

      // Pending payments count
      Payment.countDocuments({ status: "pending" }),

      // Revenue by type
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]),

      // Recent payments
      Payment.find()
        .populate("user", "name email")
        .populate("property", "name location")
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      analytics: {
        totalRevenue: totalRevenue[0]?.total || 0,
        successfulPayments,
        failedPayments,
        pendingPayments,
        revenueByType,
        recentPayments
      }
    });

  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// // === ADMIN: GET REVENUE ANALYTICS ===
// const getAllPayment = async (req, res) => {
//   try {
//     const [
//       totalRevenue,
//       successfulPayments,
//       failedPayments,
//       pendingPayments,
//       revenueByType,
//       recentPayments
//     ] = await Promise.all([
//       // Total revenue
//       Payment.aggregate([
//         { $match: { status: "success" } },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]),

//       // Successful payments count
//       Payment.countDocuments({ status: "success" }),

//       // Failed payments count
//       Payment.countDocuments({ status: "failed" }),

//       // Pending payments count
//       Payment.countDocuments({ status: "pending" }),

//       // Revenue by type
//       Payment.aggregate([
//         { $match: { status: "success" } },
//         { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } }
//       ]),

//       // Recent payments
//       Payment.find()
//         .populate("user", "name email")
//         .populate("property", "name location")
//         .sort({ createdAt: -1 })
//         .limit(10)
//     ]);

//     res.json({
//       success: true,
//       analytics: {
//         totalRevenue: totalRevenue[0]?.total || 0,
//         successfulPayments,
//         failedPayments,
//         pendingPayments,
//         revenueByType,
//         recentPayments
//       }
//     });

//   } catch (error) {
//     console.error("Revenue analytics error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

module.exports = {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  payListingFee,
  payInspectionFee,
  boostListing,
  getPaymentHistory,
  retryPayment,
  getAllPayment,
  getRevenueAnalytics
};