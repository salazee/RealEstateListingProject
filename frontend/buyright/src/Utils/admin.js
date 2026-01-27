// // src/utils/admin.js
// import api from '../lib/axios';

// export const getAllUsers = () => api.get('/api/getalluser'); 
// export const deleteUser = (id) => api.delete(`/api/deleteusers/${id}`);
// export const updateUser = (id,role) => api.put(`/api/updateuser/${id}`,{role})
// export const getPendingListings = () => api.get('/property/pending'); // filter on frontend
// export const approveListing = (id) => api.put(`/property/approveListing/${id}`, { id });
// export const rejectListing = (id) => api.delete(`/property/rejectListing/${id}`, { data: { id } });
// export const getAnalytics = () => api.get('/dashboard/analytics'); 

// src/utils/admin.js
import api from '../lib/axios';

// === USER MANAGEMENT ===
export const getAllUsers = () => api.get('/api/getalluser');
export const deleteUser = (id) => api.delete('/api/deleteuser', { data: { id } });
export const updateUser = (id, role) => api.put(`/api/updateuser/${id}`, { role }); // ✅ FIXED: Missing parentheses

// === LISTING MANAGEMENT ===
export const getPendingListings = () => api.get('/property/pending');
export const approveListing = (id) => api.put(`/property/approveListing/${id}`); // ✅ FIXED: Missing parentheses
export const rejectListing = (id) => api.delete('/property/rejectListing', { data: { id } });


// === INQUIRIES ===
export const getAllInquiries = () => api.get('/inquiry/allinquiries');

// === ANALYTICS & PAYMENTS ===
export const getRevenueAnalytics = () => api.get('/payment/analytics');
export const getAllPayments = (params) => api.get('/payment/allpayment', { params });
// === ANALYTICS ===
// This calls the backend analytics endpoint (recommended)
export const getAnalytics = () => api.get('/dashboard/analytics'); // ✅ FIXED: Use existing endpoint



// === DASHBOARD STATS ===
export const getDashboardStats = async () => {
  try {
    const [users, analytics, listings] = await Promise.all([
      getAllUsers(),
      getRevenueAnalytics(),
      getPendingListings()
    ]);

    return {
      totalUsers: users.data.users?.length || 0,
      buyers: users.data.users?.filter(u => u.role === 'buyer').length || 0,
      sellers: users.data.users?.filter(u => u.role === 'seller').length || 0,
      pendingListings: listings.data.pending?.length || 0,
      totalRevenue: analytics.data.analytics?.totalRevenue || 0,
      successfulPayments: analytics.data.analytics?.successfulPayments || 0
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      totalUsers: 0,
      buyers: 0,
      sellers: 0,
      pendingListings: 0,
      totalRevenue: 0,
      successfulPayments: 0
    };
  }
};

// // Alternative if you want to calculate on frontend (fallback)
// export const getManualAnalytics = async () => {
//   try {
//     const [usersRes, housesRes, pendingRes] = await Promise.all([
//       getAllUsers(),
//       api.get('/property/getHouses'),
//       getPendingListings()
//     ]);

//     const users = usersRes.data.users || [];
//     const houses = housesRes.data.data || [];
//     const pending = pendingRes.data.pending || [];
//     const approved = houses.filter(h => h.status === 'approved');

//     return {
//       data: {
//         analytics: {
//           totalUsers: users.length,
//           totalListings: houses.length,
//           pendingListings: pending.length,
//           approvedListings: approved.length,
//         }
//       }
//     };
//   } catch (error) {
//     console.error('Analytics error:', error);
//     throw error;
//   }
// };