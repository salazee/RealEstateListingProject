const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "house",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "responded", "closed"],
      default: "pending",
    },
    response:{
      type: String,
      default: null,
      trim: true,
      maxLength: [2000, 'Response cannot exceed 2000 characters']
    } ,
    respondedAt:{
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
inquirySchema.index({ buyer: 1, createdAt: -1 });
inquirySchema.index({ seller: 1, createdAt: -1 });
inquirySchema.index({ property: 1 });
inquirySchema.index({ status: 1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
