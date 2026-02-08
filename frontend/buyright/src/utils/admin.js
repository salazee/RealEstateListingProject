
import API_URL from '../lib/axios';

// === USER MANAGEMENT ===
export const getAllUsers = () => API_URL.get('/API_URL/getalluser');
export const deleteUser = (id) => API_URL.delete('/API_URL/deleteuser', { data: { id } });
export const updateUser = (id, role) => API_URL.put(`/API_URL/updateuser/${id}`, { role }); // ✅ FIXED: Missing parentheses

// === LISTING MANAGEMENT ===
export const getPendingListings = () => API_URL.get('/property/pending');
export const approveListing = (id) => API_URL.put(`/property/approveListing/${id}`); // ✅ FIXED: Missing parentheses
export const rejectListing = (id) => API_URL.delete('/property/rejectListing', { data: { id } });


// === INQUIRIES ===
export const getAllInquiries = () => API_URL.get('/inquiry/allinquiries');

// === ANALYTICS & PAYMENTS ===
export const getRevenueAnalytics = () => API_URL.get('/payment/analytics');
export const getAllPayments = (params) => API_URL.get('/payment/allpayment', { params });
// === ANALYTICS ===
// This calls the backend analytics endpoint (recommended)
export const getAnalytics = () => API_URL.get('/dashboard/analytics'); // ✅ FIXED: Use existing endpoint
export const ManageAdmins = () => API_URL.get('/admin/alladmins');
export const CreateAdmin = (data) => API_URL.post('/admin/createadmin', data);
export const DeleteAdmin = (id) => API_URL.delete(`/admin/deleteadmin/${id}`);  
export const PromoteAdmin = (id) => API_URL.put(`/admin/promotetoadmin/${id}`);
export const DemoteAdmin = (id) => API_URL.put(`/admin/demoteadmin/${id}`);



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
//       API_URL.get('/property/getHouses'),
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