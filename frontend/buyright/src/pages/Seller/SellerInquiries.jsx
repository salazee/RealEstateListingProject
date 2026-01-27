// src/pages/Seller/SellerInquiries.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellerInquiries } from '../../Utils/property';
import { toast } from 'react-hot-toast';

export default function SellerInquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, responded

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await getSellerInquiries();
      setInquiries(res.data.inquiries || []);
    } catch (error) {
      toast.error('Failed to load inquiries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (filter === 'all') return true;
    if (filter === 'pending') return inq.status === 'pending';
    if (filter === 'responded') return inq.status === 'responded';
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Buyer Enquiries</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'responded'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f} ({inquiries.filter(i => f === 'all' ? true : i.status === f).length})
          </button>
        ))}
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No inquiries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map(inquiry => (
            <div key={inquiry._id} className="border rounded-lg p-6 bg-white shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{inquiry.property?.title}</h3>
                  <p className="text-sm text-gray-500">{inquiry.property?.location}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    From: <span className="font-medium">{inquiry.buyer?.name || 'Buyer'}</span>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  inquiry.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {inquiry.status}
                </span>
              </div>

              {/* Buyer Message */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 mb-2">Buyer Message:</p>
                <p className="text-gray-700">{inquiry.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Received: {new Date(inquiry.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Your Response */}
              {inquiry.response ? (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600 mb-4">
                  <p className="text-xs text-blue-600 mb-2 font-semibold">Your Response:</p>
                  <p className="text-gray-800">{inquiry.response}</p>
                  {inquiry.respondedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Sent: {new Date(inquiry.respondedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/respond-inquiry/${inquiry._id}`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Respond to Inquiry
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}