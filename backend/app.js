const express = require('express');
const dotenv =require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors')
const helmet = require('helmet');
const path = require('path')
const houseRoute =require('./route/house');
const authRoute = require('./route/auth');
const userRoute = require('./route/user')
const dashboardRoute = require('./route/dashboard');
const inquiryRoute = require('./route/inquiry');
const paymentRoute = require('./route/payment');

dotenv.config();

const PORT = process.env.PORT || 9000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors())

app.use(helmet());
app.use('/property', houseRoute);
 app.use('/auth',authRoute);
 app.use('/api', userRoute)
 app.use('/dashboard', dashboardRoute);
 app.use('/inquiry',inquiryRoute);
 app.use('/payment',paymentRoute)
 app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  });
  
 
// app.use('/user', userRoute)
connectDB();
app.listen(PORT, ()=>{
    console.log(`Server running at ${PORT} `)
});