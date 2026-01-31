import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOptimizedImage } from '../../utils/image';
import { getMyListing, deleteHouse,payListingFee,boostListing,initializePayment} from '../../utils/Property';
import { toast } from 'react-hot-toast';

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(null);
  const [selectedBoostDays, setSelectedBoostDays] = useState(7);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await getMyListing();
      setListings(res.data.data|| []);
    } catch (error) {
      toast.error('Failed to load listings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteHouse(id);
      toast.success('Listing deleted successfully');
      fetchListings();
    } catch (error) {
      toast.error('Failed to delete listing');
      console.error(error);
    
    }
  };

  // const handleStatusChange = async (id, newStatus) => {
  //   try {
  //     await updateListingStatus(id, newStatus);
  //     toast.success(`Listing marked as ${newStatus}`);
  //     setListings(listings.map(l => 
  //       l._id === id ? { ...l, propertyStatus: newStatus } : l
  //     ));
  //   } catch (error) {
  //     toast.error('Failed to update status');
  //     console.error(error);
  //   }
  // };

  // const getStatusColor = (status) => {
  //   const colors = {
  //     pending: 'bg-yellow-100 text-yellow-800',
  //     approved: 'bg-green-100 text-green-800',
  //     rejected: 'bg-red-100 text-red-800',
  //     available: 'bg-blue-100 text-blue-800',
  //     sold: 'bg-gray-100 text-gray-800',
  //     foreclosed: 'bg-purple-100 text-purple-800'
  //   };
  //   return colors[status] || 'bg-gray-100 text-gray-800';
  // };

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });

  const statusCounts = {
    all: listings.length,
    pending: listings.filter(l => l.status === 'pending').length,
    approved: listings.filter(l => l.status === 'approved').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  };

  
  const handlePayListingFee = async (propertyId) => {
    try {
      setProcessingPayment(propertyId);
      
      // Create payment
      const paymentRes = await payListingFee(propertyId);
      const paymentId = paymentRes.data.paymentId;
      
      // Initialize payment with Paystack
      const initRes = await initializePayment(paymentId);
      
      // Redirect to Paystack
      if (initRes.data.authorization_url) {
        window.location.href = initRes.data.authorization_url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  
  const handleBoost = async () => {
    if (!showBoostModal) return;
    
    try {
      setProcessingPayment(showBoostModal);
      
      // Create boost payment
      const paymentRes = await boostListing(showBoostModal, selectedBoostDays);
      const paymentId = paymentRes.data.paymentId;
      
      // Initialize payment
      const initRes = await initializePayment(paymentId);
      
      // Redirect to Paystack
      if (initRes.data.authorization_url) {
        window.location.href = initRes.data.authorization_url;
      }
    } catch (error) {
      console.error('Boost error:', error);
      toast.error(error.response?.data?.message || 'Failed to boost listing');
    } finally {
      setProcessingPayment(null);
      setShowBoostModal(null);
    }
  };

  if (loading) {
    return (<div className="flex justify-center items-center min-h-screen">
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
    </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <button
          onClick={() => navigate('/create-listing')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Listing
        </button>
      </div>
      

{/* Filter Tabs */}
<div className="flex gap-2 mb-6 overflow-x-auto">
  {['all', 'pending', 'approved', 'rejected'].map(f => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
        filter === f
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {f} ({statusCounts[f]})
    </button>
  ))}
</div>

{filteredListings.length === 0 ? (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <p className="text-gray-500 text-lg mb-4">No listings found</p>
    <button
      onClick={() => navigate('/create-listing')}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
    >
      Create Your First Listing
    </button>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredListings.map(listing => (
      <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Image */}
        <div className="relative h-48">
          <img
            src={getOptimizedImage(listing.images?.[0]) || '/placeholder.jpg'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          {listing.isFeatured && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
              ⭐ BOOSTED
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{listing.name}</h3>
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">{listing.description}</p>
          <p className="text-blue-600 font-bold mb-2">₦{listing.price?.toLocaleString()}</p>
          <p className="text-sm text-gray-700 mb-2">Address:  {listing.address}</p>
          <p className="text-sm text-gray-700 mb-3">{listing.location}</p>
          
          {/* <p className="text-sm text-gray-600 mb-2">{listing.size} sqft</p> */}
          <p className="text-sm text-gray-700 mb-4">{listing.propertyType} • {listing.bedrooms} Beds • {listing.bathrooms} Baths</p>
        

          {/* Status Badge */}
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
            listing.status === 'approved' 
              ? 'bg-green-100 text-green-800'
              : listing.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {listing.status}
          </span>

          {/* Pending - Show Pay Listing Fee */}
          {listing.status === 'pending' && !listing.isVerified && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800 mb-2">
                Pay ₦5,000 listing fee to publish
              </p>
              <button
                onClick={() => handlePayListingFee(listing._id)}
                disabled={processingPayment === listing._id}
                className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:bg-gray-400"
              >
                {processingPayment === listing._id ? 'Processing...' : 'Pay Listing Fee'}
              </button>
            </div>
          )}

          {/* Approved - Show Boost Option */}
          {listing.status === 'approved' && (
            <div className="mb-3">
              {listing.isFeatured ? (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                  <p className="text-xs text-green-700">
                    Boosted until {new Date(listing.featuredUntil).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowBoostModal(listing._id)}
                  className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                >
                  🚀 Boost Listing
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/edit-listing/${listing._id}`)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(listing._id)}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

{/* Boost Modal */}
{showBoostModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full p-6">
      <h3 className="text-xl font-bold mb-4">Boost Your Listing</h3>
      <p className="text-gray-600 mb-4">
        Boost your listing to appear at the top of search results
      </p>

      <div className="space-y-3 mb-6">
        {[
          { days: 7, price: 5000 },
          { days: 14, price: 9000 },
          { days: 30, price: 15000 }
        ].map(option => (
          <label
            key={option.days}
            className={`block p-4 border-2 rounded-lg cursor-pointer ${
              selectedBoostDays === option.days
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name="boostDays"
              value={option.days}
              checked={selectedBoostDays === option.days}
              onChange={() => setSelectedBoostDays(option.days)}
              className="mr-3"
            />
            <span className="font-semibold">{option.days} Days</span>
            <span className="float-right text-blue-600 font-bold">
              ₦{option.price.toLocaleString()}
            </span>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowBoostModal(null)}
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleBoost}
          disabled={processingPayment === showBoostModal}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {processingPayment === showBoostModal ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  </div>
)}
</div>
);
}

      