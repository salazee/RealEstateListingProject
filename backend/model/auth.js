const mongoose = require('mongoose');

const userSchema= new mongoose.Schema({
     name:{
        type:String,
        required:true
     },
      email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true
     },
      password:{
        type:String,
        required:true,
        minlength:6
     },
     phone:{
      type:String
     },
     role:{
            type:String,
            enum:["seller","buyer","admin"],
            default:"buyer",
            require:true
        },
        favourites:[
          {
            type:mongoose.Schema.Types.ObjectId,
            ref:'house'
          }
        ],

        otp: {
             type: String 
            }, 

  isVerified: { 
    type: Boolean,
     default: false 
},

  otpExpires: { 
    type: Date 
}  ,

isActive:{
  type:Boolean
}  ,
resetPasswordToken:{
  type:String,
} ,
resetPasswordExpires: {
  type:Date,
}

},

{timestamps:true} ,
)

module.exports = mongoose.model("user", userSchema)