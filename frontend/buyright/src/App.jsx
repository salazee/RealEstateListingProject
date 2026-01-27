// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminLogin from './pages/auth/AdminLogin';

// Public Pages
import Home from './pages/public/Home';
import Listings from './pages/public/Listing';
import PropertyDetail from './pages/public/PropertyDetail';

// Buyer Pages
import BuyerDashboard from './pages/Buyer/Dashboard';
import Favorites from './pages/Buyer/Favorites';
import SellerInquiries from './pages/Seller/SellerInquiries';

// Seller Pages
import SellerDashboard from './pages/Seller/Dashboard';
import CreateListing from './pages/Seller/CreateListing';
import MyListings from './pages/Seller/MyListing';
import EditListing from './pages/Seller/EditListing';

import RespondToInquiry from './pages/Seller/RespondToInquiry';
import VerifyEmail from './pages/auth/VerifyEmail';
import PaymentCallback from './pages/PaymentCallback';
import BoostListing from './pages/Seller/BoostListing';
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/Users';
import PendingListings from './pages/Admin/Pending';
// import AllListings from './pages/Admin/AllListing';
import RevenueAnalytics from './pages/Admin/RevenueAnalytics';
import AllInquiries from './pages/Admin/AllInquiry';
// import AdminOverview from './pages/Admin/Overview';
import Approvals from './pages/Admin/Approval';

function App() {
  return (

    
      <Routes>
        {/* auth routes */}
          <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        {/* Public Routes */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/allListing" element={<><Navbar /><Listings /></>} />
        <Route path="/property/:id" element={<><Navbar /><PropertyDetail /></>} />


        {/* Buyer Routes */}
        <Route path="/dashboard/buyer" element={<><Navbar /><BuyerDashboard /></>} />
        <Route path="/favorites" element={<><Navbar /><Favorites /></>} />
        

        {/* Seller Routes */}
        <Route path="/dashboard/seller" element={<><Navbar /><SellerDashboard /></>} />
        <Route path="/create-listing" element={<><Navbar /><CreateListing /></>} />
        <Route path="/MyListings" element={<><Navbar /><MyListings /></>} />
       
        <Route
        path="/edit-listing/:id"
        element={<><Navbar /><EditListing /></>}
       />
        <Route
        path="/payment/callback"
        element={<><Navbar /><PaymentCallback /></>}
      />
      <Route
        path="/boost-listing/:id"
        element={<><Navbar /><BoostListing /></>}
      />
      
      <Route
        path="/sellerinquiries"
        element={
         <><Navbar /><SellerInquiries /></>
        }
      />
        {/* <Route path="/seller-inquiries" element={<><Navbar /><SellerInquiries /></>} /> */}
        <Route path="/respond-inquiry/:id" element={<><Navbar /><RespondToInquiry /></>} />

        {/* Admin Routes */}
        <Route path="/dashboard/admin" element={<><Navbar /><AdminDashboard /></>} />
        {/* <Route index element={<AdminOverview />} /> */}
        <Route path="/dashboard/admin/users" element={<><Navbar /><UserManagement /></>} />
        <Route path="/dashboard/admin/approvals" element={<><Navbar /><Approvals /></>} />

        <Route path="/dashboard/admin/pending" element={<><Navbar /><PendingListings /></>} />
        {/* <Route path="/dashboard/admin/all-listings" element={<><Navbar /><AllListings /></>} /> */}
        {/* <Route path='/payment/allpayment' element={<><Navbar /><AllPayment/></>}/> */}
        <Route path="/dashboard/admin/revenue" element={<><Navbar /><RevenueAnalytics /></>} />
        <Route path="/dashboard/admin/inquiries" element={<><Navbar /><AllInquiries /></>} />
      </Routes>
  
  );
}

export default App;