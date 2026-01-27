// src/pages/admin/AllInquiries.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function AdminAllInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      // You'll need to create this endpoint on backend
      const res = await api.get('/inquiry/all'); // Admin endpoint
      setInquiries(res.data.inquiries || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'replied': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (filter === 'all') return true;
    return inq.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin mb-2"></div>
          <p>Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Inquiries ({inquiries.length})</h1>
        <Link
          to="/dashboard/admin"
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Status
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-64 p-2 border rounded"
        >
          <option value="all">All Inquiries</option>
          <option value="pending">Pending</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-4">📧</div>
          <p className="text-gray-600">No inquiries found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Property
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Buyer
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Seller
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Message
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInquiries.map((inq) => (
                <tr key={inq._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link
                      to={`/property/${inq.property?._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {inq.property?.name || 'N/A'}
                    </Link>
                    <p className="text-xs text-gray-500">{inq.property?.location}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm">{inq.buyer?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{inq.buyer?.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm">{inq.seller?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{inq.seller?.email}</p>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="line-clamp-2 text-sm">{inq.message}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(inq.status)}`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}