// // src/pages/Admin/AllListings.jsx
// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { getHouses, deleteHouse, approveListing, rejectListing } from '../../Utils/property';
// import { toast } from 'react-hot-toast';
// import { 
//   PencilIcon, 
//   TrashIcon, 
//   CheckCircleIcon, 
//   XCircleIcon, 
//   EyeIcon,
//   MagnifyingGlassIcon,
//   HomeIcon
// } from '@heroicons/react/24/outline';

// export default function AdminAllListings() {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState({
//     status: 'all',
//     search: ''
//   });

//   useEffect(() => {
//     fetchListings();
//   }, [filter.status]);

//   const fetchListings = async () => {
//     setLoading(true);
//     try {
//       const res = await getHouses();
//       let allListings = res.data.data || [];
      
//       // Filter by status if not 'all'
//       if (filter.status !== 'all') {
//         allListings = allListings.filter(l => l.status === filter.status);
//       }
      
//       setListings(allListings);
//     } catch (err) {
//       console.error('Failed to fetch listings:', err);
//       toast.error('Failed to load listings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

//     try {
//       await deleteHouse(id);
//       setListings(listings.filter(l => l._id !== id));
//       toast.success('Listing deleted successfully');
//     } catch (err) {
//       console.error('Delete error:', err);
//       toast.error(err.response?.data?.message || 'Failed to delete listing');
//     }
//   };

//   const handleApprove = async (id, name) => {
//     if (!window.confirm(`Approve "${name}"?`)) return;

//     try {
//       await approveListing(id);
//       setListings(listings.map(l => 
//         l._id === id ? { ...l, status: 'approved' } : l
//       ));
//       toast.success('Listing approved successfully');
//     } catch (err) {
//       console.error('Approve error:', err);
//       toast.error(err.response?.data?.message || 'Failed to approve');
//     }
//   };

//   const handleReject = async (id, name) => {
//     if (!window.confirm(`Reject "${name}"? This will delete it permanently.`)) return;

//     try {
//       await rejectListing(id);
//       setListings(listings.filter(l => l._id !== id));
//       toast.success('Listing rejected and deleted');
//     } catch (err) {
//       console.error('Reject error:', err);
//       toast.error(err.response?.data?.message || 'Failed to reject');
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'approved': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'rejected': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//       minimumFractionDigits: 0,
//     }).format(price);
//   };

//   const filteredListings = listings.filter(listing =>
//     listing.name.toLowerCase().includes(filter.search.toLowerCase()) ||
//     listing.location.toLowerCase().includes(filter.search.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin mb-2"></div>
//           <p>Loading all listings...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-2">
//           <HomeIcon className="w-6 h-6 text-blue-600" />
//           <h1 className="text-2xl font-bold">All Listings ({listings.length})</h1>
//         </div>
//         <Link
//           to="/dashboard/admin"
//           className="text-blue-600 hover:underline flex items-center gap-1"
//         >
//           <span>Back to Dashboard</span>
//         </Link>
//       </div>

//       {/* Filters */}
//       <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
//               Search
//             </label>
//             <input
//               type="text"
//               value={filter.search}
//               onChange={(e) => setFilter({ ...filter, search: e.target.value })}
//               placeholder="Search by name or location..."
//               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Status Filter
//             </label>
//             <select
//               value={filter.status}
//               onChange={(e) => setFilter({ ...filter, status: e.target.value })}
//               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             >
//               <option value="all">All Statuses</option>
//               <option value="approved">Approved</option>
//               <option value="pending">Pending</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Listings Grid */}
//       {filteredListings.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-600">No listings found</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredListings.map((listing) => (
//             <div
//               key={listing._id}
//               className="border rounded-lg overflow-hidden hover:shadow-md transition bg-white"
//             >
//               <div className="relative">
//                 <img
//                   src={listing.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
//                   alt={listing.name}
//                   className="w-full h-40 object-cover"
//                   onError={(e) => {
//                     e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
//                   }}
//                 />
//                 <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(listing.status)}`}>
//                   {listing.status}
//                 </span>
//               </div>

//               <div className="p-4">
//                 <h3 className="font-semibold line-clamp-1 mb-1">{listing.name}</h3>
//                 <p className="text-blue-600 font-medium">{formatPrice(listing.price)}</p>
//                 <p className="text-gray-600 text-sm">{listing.location}</p>
//                 <p className="text-gray-500 text-xs mt-1">
//                   Owner: {listing.owner?.name || 'Unknown'}
//                 </p>
//                 <p className="text-gray-500 text-xs">Views: {listing.views || 0}</p>

//                 {/* Actions */}
//                 <div className="mt-3 grid grid-cols-2 gap-2">
//                   <Link
//                     to={`/property/${listing._id}`}
//                     className="flex items-center justify-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded"
//                   >
//                     <EyeIcon className="w-4 h-4" />
//                     <span>View</span>
//                   </Link>

//                   <Link
//                     to={`/edit-listing/${listing._id}`}
//                     className="flex items-center justify-center gap-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1.5 rounded"
//                   >
//                     <PencilIcon className="w-4 h-4" />
//                     <span>Edit</span>
//                   </Link>

//                   {listing.status === 'pending' && (
//                     <>
//                       <button
//                         onClick={() => handleApprove(listing._id, listing.name)}
//                         className="flex items-center justify-center gap-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1.5 rounded"
//                       >
//                         <CheckCircleIcon className="w-4 h-4" />
//                         <span>Approve</span>
//                       </button>

//                       <button
//                         onClick={() => handleReject(listing._id, listing.name)}
//                         className="flex items-center justify-center gap-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1.5 rounded"
//                       >
//                         <XCircleIcon className="w-4 h-4" />
//                         <span>Reject</span>
//                       </button>
//                     </>
//                   )}

//                   <button
//                     onClick={() => handleDelete(listing._id, listing.name)}
//                     className="flex items-center justify-center gap-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1.5 rounded col-span-2"
//                   >
//                     <TrashIcon className="w-4 h-4" />
//                     <span>Delete</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }