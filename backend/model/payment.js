const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: "user",
     required:true
     },
     property:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"house"
     },
     
  type: {
    type: String,
    enum: ["listing", "inspection", "boost"],
    required: true
  },
amount: {
   type: Number,
   required:true
},

  reference: String,
  status: {
    type:String,
   enum: ["pending","success","failed"],
  },

  purpose: String
,
boostDays:Number,

  paidAt: Date,
},
 { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
