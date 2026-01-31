// src/pages/admin/Approvals.jsx
import { useState, useEffect } from 'react';
import { getPendingListings, approveListing, rejectListing } from '../../utils/admin';
import { toast } from 'react-hot-toast';

export default function AdminApprovals() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await getPendingListings();
      setListings(res.data.pending || []);
    } catch (error) {
      toast.error('Failed to load pending listings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveListing({ id });
      setListings(listings.filter(l => l._id !== id));
      toast.success('Listing approved');
    } catch (error) {
      toast.error('Failed to approve', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectListing({ id });
      setListings(listings.filter(l => l._id !== id));
      toast.success('Listing rejected');
    } catch (error) {
      toast.error('Failed to reject', error);
    }
  };

  if (loading) return <div className="p-6">Loading pending listings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{listings.length} Pending Listings</h1>

      {listings.length === 0 ? (
        <p className="text-gray-500">No pending listings</p>
      ) : (
        <div className="space-y-6">
          {listings.map(listing => (
            <div key={listing._id} className="border rounded p-4">
              <div className="flex gap-4">
                <img
                  src={listing.images[0] || 'https://via.placeholder.com/150'}
                  alt={listing.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold">{listing.name}</h3>
                  <p className="text-primary">₦{listing.price.toLocaleString()}</p>
                  <p className="text-gray-600">{listing.location}</p>
                  <p className="mt-2 text-sm">{listing.description.substring(0, 100)}...</p>
                  <div className="mt-3">
                    <span className="text-sm">Owner: {listing.owner?.name || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleApprove(listing._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(listing._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}