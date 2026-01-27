const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
        minlength:30
    },
    price:{
         type:Number,
        required:true,
    
    },
    address:{
        type:String
    },
    
    images:{
        type:[String],
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    property:{
        type:String,
        required:true,
        enum:["apartment","condo","house"],
    },
    bedrooms:{
        type:Number,
    },
    bathrooms:{
        type:Number,
    },
    squarefoot:{
        type:Number,
},
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "user",
    // required: true, // so every listing belongs to someone

    },
    status:{
        type:String,
        required:true,
        enum:["approved","pending","rejected",],
        default:"pending",
    },
views:{
    type:Number,
    default:0
},
},
{timestamps:true}
)

module.exports=mongoose.model('house',houseSchema)