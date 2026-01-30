const Inquiry = require("../model/inquiry");
const House = require("../model/house");

const createInquiry = async (req, res) => {
  try {
    const { message ,propertyId} = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const property = await House.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const buyerId = req.user._id || req.user.id;
    const sellerId = property.owner._id || property.owner;
    // Prevent buyers from inquiring about their own properties
    if (buyerId.toString() === sellerId.toString()) {
      return res.status(400).json({
        message: "You cannot inquire about your own property"
      });
    }


    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: buyerId,
      seller: sellerId,
      message:message.trim(),
      status: 'pending'
    });

    //populate the inquiry before sending response
    await inquiry.populate([
      { path: 'buyer', select: 'name email' },
      { path: 'property', select: 'title location price images owner' },
      {path: 'seller', select: 'name email' }
    ]);

    res.status(201).json({ message: "Inquiry sent successfully", inquiry });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to create inquiry",
      error: error.message });
  }
};


const respondToInquiry = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Reply cannot be empty" 
      });
    }
    const inquiry = await Inquiry.findById(req.params.id)
    .populate('property', 'title name location price images owner')
    .populate('seller', 'name email');

    if (!inquiry) {
  return res.status(404).json({ 
        success: false,
        message: "Inquiry not found" 
      });
    
    }
    
    // ✅ Check if user is the property owner (seller)
    const userId = req.user._id || req.user.id;
    const propertyOwnerId = inquiry.property.owner._id 
      ? inquiry.property.owner._id.toString() 
      : inquiry.property.owner.toString();
    
    if (propertyOwnerId !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to respond to this inquiry" 
      });
    }

    // Check if already responded
    if (inquiry.status === 'responded') {
      return res.status(400).json({
        success: false,
        message: "You have already responded to this inquiry"
      });
    }


        // ✅ Update with correct field name
    inquiry.response = reply.trim();
    inquiry.status = "responded";  
    inquiry.respondedAt = new Date();
    await inquiry.save();
    
    // Re-populate after save
    await inquiry.populate([
      { path: 'property', select: 'title name location price images' },
      { path: 'buyer', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: "Response sent successfully",
      inquiry
    });

  } catch (error) {
    console.error('Respond to inquiry error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to inquiry",
      error:error.message
    });
  }
};



getSingleInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('property', 'title location price images owner');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }
    
    // ✅ Check authorization - only seller or admin can view
    const userId = req.user._id || req.user.id;
    const propertyOwnerId = inquiry.property.owner._id 
      ? inquiry.property.owner._id.toString() 
      : inquiry.property.owner.toString();
    

      // Check authorization - seller, buyer, or admin can view
    const isSeller = propertyOwnerId === userId.toString();
    const isBuyer = inquiry.buyer._id.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isBuyer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this inquiry',
      });
    }
    res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error('Get single inquiry error:', error);
    res.status(500).json({  
      success: false,
      message: 'Failed to fetch inquiry',
      error:error.message
    });
  }
};

// ✅ Get inquiries for properties OWNED by the logged-in seller
const getSellerInquiries = async (req, res) => {
  try {
    // Find all properties owned by this seller
    const userId = req.user._id || req.user.id;

    const sellerProperties = await House.find({ owner: req.user.id }).select('_id');
    const propertyIds = sellerProperties.map(p => p._id);
    
    // Find inquiries for those properties
    const inquiries = await Inquiry.find({ property: { $in: propertyIds } })
      .populate('buyer', 'name email')
      .populate('property', 'title images location price')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true,
      inquiries 
    });
  } catch (error) {
    console.error('Error fetching seller inquiries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};


const getBuyerInquiries = async (req,res) =>{
  try{
    const buyerId = req.user._id;
    const inquiries = await Inquiry.find({ buyer: buyerId })
      .populate('property', 'title images location price owner')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true,
      count: inquiries.length,
      inquiries 
    });
  } catch (error) {
    console.error('Error fetching buyer inquiries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch inquiries' ,
      error: error.message
    });
  }
}

// Get inquiries SENT TO the logged-in seller
// const getSellerInquiries = async (req, res) => {
//   try {
//     const inquiries = await Inquiry.find({ seller: req.user.id })
//       .populate('buyer', 'name email')
//       .populate('property', 'name images location price')
//       .sort({ createdAt: -1 });

//     res.status(200).json({ inquiries });
//   } catch (error) {
//     console.error('Error fetching seller inquiries:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('property', 'name location')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true,
      count: inquiries.length,
    });
  } catch (error) {
    console.error('Error fetching all inquiries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch inquiries' ,
      error: error.message
    });
  }
};

module.exports ={createInquiry,respondToInquiry, getSingleInquiry, getSellerInquiries,getBuyerInquiries,getAllInquiries}
