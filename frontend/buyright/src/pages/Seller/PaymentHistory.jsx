// src/pages/seller/PaymentHistory.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      params.append('page', filter.page);
      params.append('limit', 10);

      const res = await api.get(`/payment/history?${params}`);
      setPayments(res.data.payments);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (paymentId) => {
    if (!window.confirm('Retry this payment?')) return;

    try {
      const res = await api.post(`/payment/retry/${paymentId}`);
      toast.success('Payment retry initialized');
      
      // Redirect to initialize
      const initRes = await api.post(`/payment/initialize/${res.data.paymentId}`);
      window.location.href = initRes.data.authorization_url;
    } catch (err) {
      console.error('Retry error:', err);
      toast.error(err.response?.data?.message || 'Failed to retry payment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      listing: 'Listing Fee',
      inspection: 'Inspection',
      boost: 'Boost'
    };
    return labels[type] || type;
  };

  if (loading && filter.page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin mb-2"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment History</h1>
        <button
          onClick={() => navigate('/dashboard/seller')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value, page: 1 })}
              className="w-full p-2 border rounded"
            >
              <option value="">All Types</option>
              <option value="listing">Listing Fee</option>
              <option value="inspection">Inspection</option>
              <option value="boost">Boost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value, page: 1 })}
              className="w-full p-2 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="success">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter({ type: '', status: '', page: 1 });
              }}
              className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-4">💳</div>
          <p className="text-gray-600">No payment history found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Payment Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(payment.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{getTypeLabel(payment.type)}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>

                    {payment.property && (
                      <p className="text-sm text-gray-600">
                        Property: {payment.property.name}
                      </p>
                    )}

                    <p className="text-sm text-gray-500">
                      Ref: {payment.reference}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xl font-bold text-blue-600">
                    ₦{payment.amount.toLocaleString()}
                  </p>

                  {payment.status === 'failed' && (
                    <button
                      onClick={() => handleRetry(payment._id)}
                      className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Retry
                    </button>
                  )}

                  {payment.status === 'pending' && (
                    <button
                      onClick={() => handleRetry(payment._id)}
                      className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      Complete Payment
                    </button>
                  )}

                  {payment.property && (
                    <button
                      onClick={() => navigate(`/property/${payment.property._id}`)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Property
                    </button>
                  )}
                </div>
              </div>

              {payment.failureReason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Failure Reason:</strong> {payment.failureReason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
            disabled={filter.page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
            disabled={filter.page === pagination.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}