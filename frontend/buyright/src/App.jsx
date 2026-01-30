// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminLogin from './pages/auth/AdminLogin';
import Home from './pages/public/Home';
import Listings from './pages/public/Listings';
import PropertyDetail from './pages/public/PropertyDetail';
import BuyerDashboard from './pages/Buyer/Dashboard';
import BuyerEnquiries from './pages/Buyer/BuyerEnquiries';
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
import ManageAdmins from './pages/Admin/ManageAdmin';
import PendingListings from './pages/Admin/Pending';
import RevenueAnalytics from './pages/Admin/RevenueAnalytics';
import Approvals from './pages/Admin/Approval';

function App() {
  return (

    
      <Routes>
          <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/allListing" element={<><Navbar /><Listings /></>} />
        <Route path="/property/:id" element={<><Navbar /><PropertyDetail /></>} />
        <Route path="/dashboard/buyer" element={<><Navbar /><BuyerDashboard /></>} />
        <Route path="/buyerenquiries" element={<><Navbar /><BuyerEnquiries /></>} />
        <Route path="/favorites" element={<><Navbar /><Favorites /></>} />
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
      
        <Route path="/respond-inquiry/:id" element={<><Navbar /><RespondToInquiry /></>} />

       
        <Route path="/dashboard/admin" element={<><Navbar /><AdminDashboard /></>} />
       
        <Route path="/dashboard/admin/users" element={<><Navbar /><UserManagement /></>} />
        <Route path="/dashboard/admin/manageadmins" element={<><Navbar /><ManageAdmins /></>} />
        <Route path="/dashboard/admin/approvals" element={<><Navbar /><Approvals /></>} />

        <Route path="/dashboard/admin/pending" element={<><Navbar /><PendingListings /></>} />
        
        <Route path="/dashboard/admin/revenue" element={<><Navbar /><RevenueAnalytics /></>} />
       
      </Routes>
  
  );
}

export default App;