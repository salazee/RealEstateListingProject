// // 
// // src/pages/admin/Dashboard.jsx
// import { useEffect, useState, useCallback } from 'react';
// import { Outlet, Link } from 'react-router-dom';
// import { toast } from 'react-hot-toast';

// import {
//   getPendingListings,
//   getAnalytics,
// } from '../../Utils/admin';

// import api from '../../lib/axios';

// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [pendingListings, setPendingListings] = useState([]);

//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalListings: 0,
//     pendingListings: 0,
//     approvedListings: 0,
//     rejectedListings: 0,
//     totalRevenue: 0,
//   });

//   const fetchDashboard = useCallback(async () => {
//     setLoading(true);

//     try {
//       const [
//         pendingRes,
//         analyticsRes,
//         usersRes,
//         paymentsRes,
//         listingsRes,
//       ] = await Promise.all([
//         getPendingListings(),
//         getAnalytics().catch(() => ({ data: {} })),
//         api.get('/api/getalluser'),
//         api.get('/payment/getallpayments'),
//         api.get('/property/gethouses'),
//       ]);

//       const users = usersRes?.data?.users || [];
//       const payments = paymentsRes?.data?.payments || [];
//       const listings = listingsRes?.data?.property || [];
//       const pending = pendingRes?.data?.pending || [];

//       const approvedListings = listings.filter(
//         (l) => l.status === 'approved'
//       ).length;

//       const rejectedListings = listings.filter(
//         (l) => l.status === 'rejected'
//       ).length;

//       const totalRevenue = payments
//         .filter((p) => p.status === 'completed')
//         .reduce((sum, p) => sum + (p.amount || 0), 0);

//       setPendingListings(pending);

//       setStats({
//         totalUsers: users.length,
//         totalListings: listings.length,
//         pendingListings: pending.length,
//         approvedListings,
//         rejectedListings,
//         totalRevenue,
//       });

//     } catch (error) {
//       console.error('Dashboard error:', error);
//       toast.error('Failed to load admin dashboard');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboard();
//   }, [fetchDashboard]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-8 h-8 border-4 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
//           <p>Loading admin dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//         <button
//           onClick={fetchDashboard}
//           className="text-sm text-blue-600 hover:underline"
//         >
//           🔄 Refresh
//         </button>
//       </div>

//       {/* STATS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="blue" />
//         <StatCard title="Total Listings" value={stats.totalListings} icon="🏘️" color="green" />
//         <StatCard title="Pending Approval" value={stats.pendingListings} icon="⏳" color="yellow" />
//         <StatCard title="Approved Listings" value={stats.approvedListings} icon="✅" color="purple" />
//       </div>

//       {/* MAIN GRID */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* QUICK ACTIONS */}
//         <div className="lg:col-span-2">
//           <div className="bg-white border rounded-lg p-6 shadow-sm">
//             <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <ActionCard
//                 to="/dashboard/admin/users"
//                 icon="👥"
//                 title="Manage Users"
//                 subtitle={`${stats.totalUsers} total users`}
//               />

//               <ActionCard
//                 to="/dashboard/admin/pending"
//                 icon="📋"
//                 title="Review Listings"
//                 subtitle={`${stats.pendingListings} pending approval`}
//               />

//               <ActionCard
//                 to="/dashboard/admin/revenue"
//                 icon="💰"
//                 title="Revenue Analytics"
//                 subtitle="View payment stats"
//               />

//               <ActionCard
//                 to="/allListing"
//                 icon="🏠"
//                 title="All Listings"
//                 subtitle={`${stats.approvedListings} approved`}
//               />
//             </div>
//           </div>
//         </div>

//         {/* PENDING PREVIEW */}
//         <div className="bg-white border rounded-lg p-6 shadow-sm">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="font-semibold text-lg">Recent Pending</h2>
//             <Link
//               to="/dashboard/admin/pending"
//               className="text-blue-600 text-sm hover:underline"
//             >
//               View all
//             </Link>
//           </div>

//           {pendingListings.length === 0 ? (
//             <EmptyState />
//           ) : (
//             <ul className="space-y-3">
//               {pendingListings.slice(0, 5).map((listing) => (
//                 <li key={listing._id} className="border-b pb-2 last:border-b-0">
//                   <p className="font-medium text-sm line-clamp-1">
//                     {listing.name}
//                   </p>
//                   <p className="text-xs text-gray-600">
//                     {listing.location}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     by {listing.owner?.name || 'Unknown'}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>

//       {/* NESTED ROUTES */}
//       <div className="mt-6">
//         <Outlet context={{ refreshDashboard: fetchDashboard }} />
//       </div>
//     </div>
//   );
// }

// /* -------------------- COMPONENTS -------------------- */

// const StatCard = ({ title, value, icon, color }) => {
//   const colors = {
//     blue: 'bg-blue-50 border-blue-200',
//     green: 'bg-green-50 border-green-200',
//     yellow: 'bg-yellow-50 border-yellow-200',
//     purple: 'bg-purple-50 border-purple-200',
//   };

//   return (
//     <div className={`border rounded-lg p-4 ${colors[color]}`}>
//       <div className="flex justify-between mb-2">
//         <p className="text-sm text-gray-600">{title}</p>
//         <span className="text-2xl">{icon}</span>
//       </div>
//       <p className="text-3xl font-bold">{value}</p>
//     </div>
//   );
// };

// const ActionCard = ({ to, icon, title, subtitle }) => (
//   <Link
//     to={to}
//     className="p-4 border rounded-lg text-center hover:bg-gray-50 transition"
//   >
//     <div className="text-3xl mb-2">{icon}</div>
//     <h3 className="font-medium">{title}</h3>
//     <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
//   </Link>
// );

// const EmptyState = () => (
//   <div className="text-center py-6">
//     <div className="text-3xl mb-2">✨</div>
//     <p className="text-gray-500 text-sm">No pending listings!</p>
//   </div>
// );

// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { getDashboardStats } from '../../utils/admin';
import { toast } from 'react-hot-toast';
import { 
  UsersIcon, 
  HomeIcon, 
  BanknotesIcon, 
  DocumentCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    buyers: 0,
    sellers: 0,
    pendingListings: 0,
    totalRevenue: 0,
    successfulPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { path: '/dashboard/admin', label: 'Overview', icon: ChartBarIcon, end: true },
    { path: '/dashboard/admin/users', label: 'Users', icon: UsersIcon },
    { path: '/dashboard/admin/pending', label: 'Pending Listings', icon: HomeIcon },
    { path: '/dashboard/admin/revenue', label: 'Revenue', icon: BanknotesIcon },
    { path: '/dashboard/admin/approvals', label: 'Approvals', icon: DocumentCheckIcon }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={fetchStats}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh Stats
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin"></div>
            <p className="mt-2">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle={`${stats.buyers} Buyers, ${stats.sellers} Sellers`}
              icon={<UsersIcon className="w-8 h-8" />}
              color="blue"
            />
            <StatCard
              title="Pending Listings"
              value={stats.pendingListings}
              subtitle="Awaiting approval"
              icon={<HomeIcon className="w-8 h-8" />}
              color="yellow"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              subtitle={`${stats.successfulPayments} successful payments`}
              icon={<BanknotesIcon className="w-8 h-8" />}
              color="green"
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <nav className="flex overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-blue-600 text-blue-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content Area - Nested Routes */}
        <Outlet context={{ refreshDashboard: fetchStats }} />
      </div>
    </div>
  );
}

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}