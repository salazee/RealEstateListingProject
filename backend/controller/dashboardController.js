
const Property = require("../model/house");
const User = require("../model/auth");
const Payment = require('../model/payment');


const buyerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("favourites");

    res.json({
      totalFavourites: user.favourites.length,
      favourites: user.favourites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const sellerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalListings = await Property.countDocuments({ owner: userId });
    const activeListings = await Property.countDocuments({ owner: userId, status: "active" });
    const pendingListings = await Property.countDocuments({ owner: userId, status: "pending" });

    res.json({
      totalListings,
      activeListings,
      pendingListings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 


const adminDashboard = async (req, res) => {
  try {
    // USERS
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: "buyer" });
    const sellers = await User.countDocuments({ role: "seller" });
    const admins = await User.countDocuments({ role: "admin" });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // PROPERTIES
    const totalListings = await Property.countDocuments();
    const approvedListings = await Property.countDocuments({ status: "approved" });
    const pendingListings = await Property.countDocuments({ status: "pending" });
    const rejectedListings = await Property.countDocuments({ status: "rejected" });

    // PROPERTY TYPES
    const propertyTypes = await Property.aggregate([
      { $group: { _id: "$property", count: { $sum: 1 } } }
    ]);

    // VIEWS
    const totalViewsAgg = await Property.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const totalViews = totalViewsAgg[0]?.totalViews || 0;

    // TOP VIEWED PROPERTIES
    const topViewed = await Property.find()
      .sort({ views: -1 })
      .limit(5)
      .select("name views price location");

    res.status(200).json({
      users: {
        totalUsers,
        buyers,
        sellers,
        admins,
        verifiedUsers
      },
      listings: {
        totalListings,
        approvedListings,
        pendingListings,
        rejectedListings
      },
      propertyTypes,
      totalViews,
      topViewed
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      pendingListings,
      approvedListings,
      featuredListings,
      totalPayments,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ status: 'pending' }),
      Property.countDocuments({ status: 'approved' }),
      Property.countDocuments({ isFeatured: true, featuredUntil: { $gt: new Date() } }),
      Payment.countDocuments({ status: 'success' }),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    res.status(200).json({
      success:true,
      analytics:{
      totalUsers,
      totalListings,
      pendingListings,
      approvedListings,
      featuredListings,
      totalPayments,
      totalRevenue: revenue,
      revenueFormatted: new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(revenue)
    }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};


module.exports={buyerDashboard, sellerDashboard, adminDashboard, getAnalytics }
