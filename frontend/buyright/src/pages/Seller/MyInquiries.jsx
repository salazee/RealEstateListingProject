// // src/pages/seller/MyInquiries.jsx
// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { getBuyerInquiries } from '../../Utils/property'; // This should be renamed to getSellerInquiries
// import { toast } from 'react-hot-toast';

// export default function MyInquiries() {
//   const [inquiries, setInquiries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchInquiries();
//   }, []);

//   const fetchInquiries = async () => {
//     try {
//       // This should return inquiries for properties owned by the current seller
//       const res = await getBuyerInquiries(); // Rename this function to getSellerInquiries for clarity
//       setInquiries(res.data.inquiries || []);
//     } catch (error) {
//       console.error('Failed to load inquiries:', error);
//       toast.error(error.response?.data?.message || 'Failed to load inquiries');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'responded': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading inquiries...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-6xl">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-900">My Inquiries</h1>
//       </div>

//       {inquiries.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <p className="text-gray-600 text-lg">No buyer inquiries yet.</p>
//           <p className="text-gray-500 mt-2">Once your listings are approved, buyers can contact you!</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
//                   <th className="px-6 py-3 text-left text-xs font medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {inquiries.map((inq) => (
//                   <tr key={inq._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <Link to={`/property/${inq.property._id}`} className="text-blue-600 hover:underline font-medium">
//                         {inq.property?.title || inq.property?.name || '—'}
//                       </Link>
//                       <p className="text-sm text-gray-600 mt-1">{inq.property?.location}</p>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <p className="font-medium text-gray-900">{inq.buyer?.name || '—'}</p>
//                         <p className="text-sm text-gray-500">{inq.buyer?.email}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 max-w-xs">
//                       <p className="text-sm text-gray-700 line-clamp-2">{inq.message}</p>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inq.status)}`}>
//                         {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(inq.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       {inq.status === 'pending' ? (
//                         <Link
//                           to={`/respond-inquiry/${inq._id}`}
//                           className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
//                         >
//                           Respond
//                         </Link>
//                       ) : (
//                         <span className="text-sm text-gray-600">Replied</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
