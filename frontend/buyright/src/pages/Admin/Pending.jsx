//pages/Admin/Pending.jsx
import { useEffect, useState } from 'react';
import {
  getPendingListings,
  approveListing,
  rejectListing
} from '../../utils/admin';
import { toast } from 'react-hot-toast';

export default function PendingListings() {
  const [listings, setListings] = useState([ ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const res = await getPendingListings();
      setListings(res.data.pending || []);
    } catch {
      toast.error('Failed to load pending listings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await approveListing(id);
    toast.success('Listing approved');
    setListings(listings.filter(l => l._id !== id));
  };

  const handleReject = async (id) => {
    await rejectListing(id);
    toast.success('Listing rejected');
    setListings(listings.filter(l => l._id !== id));
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Pending Listings ({listings.length})
      </h1>

      {listings.length === 0 && (
        <p className="text-gray-500">No pending listings</p>
      )}

      <div className="space-y-4">
        {listings.map(listing => (
          <div
            key={listing._id}
            className="border rounded p-4 flex justify-between"
          >
            <div>
              <h3 className="font-semibold">{listing.name}</h3>
              <p className="text-sm text-gray-600">{listing.location}</p>
              <p className="text-sm mt-1">₦{listing.price.toLocaleString()}</p>
              <p className="text-xs mt-1">
                Owner: {listing.owner?.name}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(listing._id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(listing._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
