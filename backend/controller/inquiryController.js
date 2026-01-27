const Inquiry = require("../model/inquiry");
const House = require("../model/house");

const createInquiry = async (req, res) => {
  try {
    const { message ,propertyId} = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = await House.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const inquiry = await Inquiry.create({
      property: propertyId,
      buyer: req.user.id,
      seller: property.owner,
      message
    });

    res.status(201).json({ message: "Inquiry sent", inquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    .populate('property', 'name email');
    if (!inquiry) {

      return res.status(404).json({ 
        success: false,
        message: "Inquiry not found" 
      });
    
    }
    
    // ✅ Check if user is the property owner (seller)
    const propertyOwnerId = inquiry.property.owner._id 
      ? inquiry.property.owner._id.toString() 
      : inquiry.property.owner.toString();
    
    if (propertyOwnerId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to respond to this inquiry" 
      });
    }


        // ✅ Update with correct field name
    inquiry.response = reply;  // Changed from 'reply' to 'response'
    inquiry.status = "responded";  // Changed from 'replied' to 'responded'
    inquiry.respondedAt = new Date();
    await inquiry.save();
    
    res.status(200).json({
      success: true,
      message: "Response sent successfully"
      // error:error.message,
      // inquiry,
    });

  } catch (error) {
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
    const propertyOwnerId = inquiry.property.owner._id 
      ? inquiry.property.owner._id.toString() 
      : inquiry.property.owner.toString();
    
    if (propertyOwnerId !== req.user.id && req.user.role !== 'admin') {
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
      inquiries 
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

module.exports ={createInquiry,respondToInquiry, getSingleInquiry, getSellerInquiries,getAllInquiries}
