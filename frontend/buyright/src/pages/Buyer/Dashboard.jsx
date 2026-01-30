
// src/pages/buyer/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavourites, getHouses } from '../../Utils/property'; // ✅ Fixed path
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { InspectIcon } from 'lucide-react';

export default function BuyerDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [favorites, setFavorites] = useState([]);
  const [houses, setHouses] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(true);
  const [loadingHouses, setLoadingHouses] = useState(true); // ✅ Added missing state
  const [loadingInquiries, setLoadingInquiries] = useState(true);

  // Fetch favorite properties
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await getFavourites();
        setFavorites(res.data.favourites || []);
      } catch (error) {
        toast.error('Failed to load favorites',error);
      } finally {
        setLoadingFavs(false);
      }
    };
    fetchFavorites();
  }, []);

  // Fetch all properties (for quick actions section - optional)
  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await getHouses();
        setHouses(res.data.data || []); // ✅ Correct response path
      } catch (error) {
        toast.error('Failed to load properties', error);
      } finally {
        setLoadingHouses(false);
      }
    };
    fetchHouses();
  }, []);

  // Fetch recent inquiries
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await getBuyerInquiries();
        setRecentInquiries(res.data.data || []);
      } catch (error) {
        console.warn('Inquiry endpoint not implemented:', error);
      } finally {
        setLoadingInquiries(false);
      }
    };
    fetchInquiries();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="text-blue-600">{user?.name}</span>!
        </h1>
        <p className="text-gray-600">Find your dream property today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/allListing" 
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center text-center border border-gray-200"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <HomeModernIcon className="w-6 h-6 text-blue-600" /> 
          </div>
          <h3 className="font-semibold text-xl">Browse Listings</h3>
          <p className="text-lg text-gray-600 mt-1">Explore available properties</p>
        </Link>

        <Link
          to="/favorites"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center text-center border border-gray-200"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
          <HeartIcon className="w-6 h-6 text-red-600" /> 
          </div>
          <h3 className="font-semibold">My Favorites</h3>
          <p className="text-sm text-gray-600 mt-1">View saved properties</p>
        </Link>

         <Link
                  to="/buyerenquiries"
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center text-center border border-gray-200"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <EnvelopeIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">My Enquiries</h3>
                  <p className="text-sm text-gray-600 mt-1">View your messages</p>
                </Link>

        <Link
          to="/allListing" 
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center text-center border border-gray-200"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
           <InspectIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold">Book Inspection</h3>
          <p className="text-sm text-gray-600 mt-1">Schedule a property visit</p>
        </Link>
      </div>

      {/* Recent Favorites */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Favorite Properties</h2>
          <Link to="/favorites" className="text-blue-600 hover:underline text-sm">
            View all
          </Link>
        </div>

        {loadingFavs ? (
          <p className="text-gray-500">Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <p className="text-gray-500">You haven’t saved any properties yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.slice(0, 3).map((house) => (
              <Link
                key={house._id}
                to={`/property/${house._id}`}
                className="border rounded-lg overflow-hidden shadow hover:shadow-md transition"
              >
                <img
                  src={house.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={house.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                  }}
                />
                <div className="p-3">
                  <h3 className="font-semibold line-clamp-1">{house.name}</h3>
                  <p className="text-blue-600 font-medium">{formatPrice(house.price)}</p>
                  <p className="text-gray-600 text-sm">{house.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Inquiries */}
      {recentInquiries.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">My Inquiries</h2>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentInquiries.slice(0, 3).map((inq) => (
                  <tr key={inq._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Link to={`/property/${inq.property?._id}`} className="text-blue-600 hover:underline">
                        {inq.property?.name || 'Unknown Property'}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        inq.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        inq.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-sm">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-bold text-blue-600 mb-2">Need help?</h3>
        <p className="text-gray-700 text-sm">
          Found a property you like? Click <strong>"Send Inquiry"</strong> to contact the seller directly!
        </p>
      </div>
    </div>
  );
}