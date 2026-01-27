const house = require('../model/house');
const User = require('../model/auth');
const Notification = require('../model/notification');

const createListing = async(req, res) => {
  const { name, description, price, images, status, property, location, address, bedrooms, bathrooms, squarefoot } = req.body;
  try {
    if (!name || !description || !price || !images || !property || !location) {
      return res.status(400).send({ message: "Invalid parameters" });
    }

    const newListing = new house({
      name,
      description,
      price,
      images,
      status: status || 'pending', // Default to pending
      property,
      location,
      address,
      bedrooms,
      bathrooms,
      squarefoot,
      owner: req.user.id // ✅ Add owner from authenticated user
    });

    const savedListing = await newListing.save();
    return res.status(200).send({ 
      message: "New Listing Created successfully! Awaiting admin approval.", 
      data: savedListing 
    });
        
  } catch (error) {
    console.error("Create Listing error:", error);
    res.status(500).send({
      message: "Internal Server error",
      error: error.message
    });
  }
};

const getHouse = async(req, res) => {
  try {
    const { id } = req.params;
    const single = await house.findById(id).populate('owner', 'name email');


    return res.status(200).send({ message: "Property Retrieved", getHouse: single });
  } catch (error) {
    console.error("Error Retrieving Property:", error);
    res.status(500).send({
      message: "Internal Server error",
      error: error.message
    });
  }
};

const recordPropertyView = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find property
    const property = await house.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment view count
    property.views = (property.views || 0) + 1;
    await property.save();

    res.status(200).json({
      success: true,
      views: property.views
    });
  } catch (error) {
    console.error('Record view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record view'
    });
  }
};

const getHouses = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      q,
      location,
      status,
      property,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      sort,
      mine
    } = req.query;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const filter = {};
    house.find({ status: 'approved' })
    .populate('owner', 'name')
  
    // ✅ CRITICAL FIX: Seller's own listings (all statuses)
    if (mine === 'true' && req.user) {
      filter.owner = req.user.id;
      // Don't filter by status - show all their listings
    } 
    // ✅ CRITICAL FIX: Public users should ONLY see approved
    else if (!req.user || mine !== 'true') {
      filter.status = 'approved';
    }

    // Search query
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Property type filter
    if (property) filter.property = property;
    
    // Admin can filter by status
    if (status && req.user?.role === 'admin') {
      filter.status = status;
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Bedroom range
    if (minBedrooms || maxBedrooms) {
      filter.bedrooms = {};
      if (minBedrooms) filter.bedrooms.$gte = Number(minBedrooms);
      if (maxBedrooms) filter.bedrooms.$lte = Number(maxBedrooms);
    }

    // Sorting
    const sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'oldest') sortOption.createdAt = 1;
    else if (sort === 'views_desc') sortOption.views = -1;
    else sortOption.createdAt = -1; // Default: newest first

    const houses = await house
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email')
      .sort(sortOption);

    const total = await house.countDocuments(filter);

    // ✅ FIX: Return as "data" to match frontend expectation
    res.status(200).json({
      message: 'Properties retrieved successfully',
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: houses // ✅ Changed from "houses" to "data"
    });
  } catch (error) {
    console.error('Error in getHouses:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

const edit = async(req, res) => {
  try {
    const { id } = req.params; // ✅ Get from params
    const { name, description, price, images, location, status, property, address, bedrooms, bathrooms, squarefoot } = req.body;
    
    if (!name && !description && !price && !images && !location && !status && !property && !address && !bedrooms===undefined && !bathrooms===undefined && !squarefoot===undefined) {
      return res.status(400).send({ message: "No fields provided to update" });
    }

    // ✅ Find house first to check ownership
    const existingHouse = await house.findById(id);
    
    if (!existingHouse) {
      return res.status(404).send({ message: "Property not found" });
    }

    // // ✅ Check authorization: owner OR admin
    // if (!existingHouse.owner|| existingHouse.owner.toString() !== req.user.id ) {
    //   return res.status(403).send({ message: "Not authorized to edit this property" });
    // }

    // Build update object (only include provided fields)
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (images) updateData.images = images;
    if (location) updateData.location = location;
    if (property) updateData.property = property;
    if (address) updateData.address = address;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms;
    if (squarefoot !== undefined) updateData.squarefoot = squarefoot;
    // Only admin can change status
    if (status && req.user.role === 'admin') {
      updateData.status = status;
    }
  


    const updatedHouse = await house.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('owner', 'name email');

    // ✅ Send notifications for price changes
    if (price && price !== existingHouse.price) {
      const users = await User.find({ favourites: id });
      for (let user of users) {
        await Notification.create({
          user: user._id,
          title: "Price update",
          message: `Price for ${existingHouse.name} has changed to ₦${price.toLocaleString()}`
        });
      }
    }

    return res.status(200).send({ 
      message: "Property Updated Successfully", 
      house: updatedHouse // ✅ Changed from "edit" to "house"
    });

  } catch (error) {
    console.error("Error editing Property:", error);

    res.status(500).send({
      message: "Internal Server error",
      error: error.message
    });
  }
};

const deleteHouse = async(req, res) => {
  try {
    const { id } = req.params; // ✅ Get from params

    const houseToDelete = await house.findById(id);
    
    if (!houseToDelete) {
      return res.status(404).send({ message: "Property not found" });
    }

    // ✅ Check authorization: owner OR admin
    if (req.user.role !== 'admin' && req.user.id !== houseToDelete.owner.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot delete this property" });
    }

    await house.findByIdAndDelete(id);

    res.status(200).json({ 
      message: "Property deleted successfully", 
      deletedHouse: houseToDelete 
    });

  } catch (error) {
    console.error("Error deleting the property:", error);
    res.status(500).json({
      message: "Internal Server error",
      error: error.message
    });
  }
};

const getMyListing = async (req, res) => {
  try {
    const houses = await house.find({ owner: req.user.id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ 
      message: "Your listings retrieved",
      data: houses 
    });

  } catch (error) {
    console.error("Error getting My Listing:", error);
    success:false,
    res.status(500).json({ message: error.message });
  }
};

const addFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { houseId } = req.body; // ✅ Get from body

    if (!houseId) {
      return res.status(400).json({ message: "houseId is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Check if already in favourites
    if (user.favourites.includes(houseId)) {
      return res.status(400).json({ message: "Already in favourites" });
    }

    user.favourites.push(houseId);
    await user.save();

    res.status(200).json({ 
      message: "Added to favourites",
      favourites: user.favourites 
    });

  } catch (error) {
    console.error("Add favourite error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { houseId } = req.body; // ✅ Get from body

    if (!houseId) {
      return res.status(400).json({ message: "houseId is required" });
    }

    // ✅ Use $pull to remove from array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favourites: houseId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Removed from favourites",
      favourites: user.favourites 
    });

  } catch (error) {
    console.error("Remove favourite error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFavourites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("favourites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      totalFavourites: user.favourites.length,
      favourites: user.favourites,
    });
  } catch (error) {
    console.error("Get favourites error:", error);
    res.status(500).json({ error: error.message });
  }
};

const approveListing = async (req, res) => {
  try {
    const { id } = req.params; // ✅ Get from params
    
    const updated = await house.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    ).populate('owner', 'name email');
    
    if (!updated) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // ✅ Optional: Notify the seller
    if (updated.owner) {
      await Notification.create({
        user: updated.owner._id,
        title: "Listing Approved",
        message: `Your listing "${updated.name}" has been approved and is now live!`
      });
    }

    res.json({ 
      message: "Listing approved", 
      house: updated 
    });
  } catch (error) {
    console.error("Approve listing error:", error);
    res.status(500).json({ message: error.message });
  }
};

const pendingListings = async (req, res) => {
  try {
    const pendingListings = await house.find({ status: 'pending' })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ pending: pendingListings });
  } catch (error) {
    console.error('Error fetching pending listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectListing = async (req, res) => {
  try {
    const { id } = req.body; // ✅ Get from body (to match frontend)
    
    if (!id) {
      return res.status(400).json({ message: "Listing ID is required" });
    }

    const rejected = await house.findById(id);
    
    if (!rejected) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // ✅ Optional: Notify the seller
    if (rejected.owner) {
      await Notification.create({
        user: rejected.owner,
        title: "Listing Rejected",
        message: `Your listing "${rejected.name}" was not approved. Please review our listing guidelines.`
      });
    }

    // ✅ Delete the listing (or set status to 'rejected')
    await house.findByIdAndDelete(id);
    
    res.json({ 
      message: "Listing rejected and deleted", 
      deletedListing: rejected 
    });
  } catch (error) {
    console.error("Reject listing error:", error);
    res.status(500).json({ message: error.message });
  }
};

const sellerStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const listings = await house.find({ owner: userId })
      .select("name views price status createdAt");
    
    const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);
    
    res.json({ 
      totalListings: listings.length, 
      totalViews, 
      listings 
    });
  } catch (error) {
    console.error("Seller stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createListing,
  edit,
  getMyListing,
  getHouse,
  getHouses,
  deleteHouse,
  addFavourite,
  removeFavourite,
  getFavourites,
  approveListing,
  rejectListing,
  sellerStats,
  pendingListings,
  recordPropertyView
};