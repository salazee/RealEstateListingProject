const mongoose = require("mongoose");
const dotenv = require('dotenv');

dotenv.config();
const MONGO = process.env.MONGO;

const connectDB = async() =>{
    try {
        await mongoose.connect(MONGO,
            {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                family: 4 // ✅ Forces IPv4 (fixes ENOTFOUND)
            }
        );
        console.log(`MongoDB connected Successfully ${MONGO}`)
    } catch (error) {
        console.log(error.message)
        process.exit(1);
    }
};

module.exports = connectDB;