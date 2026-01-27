// src/pages/admin/RevenueAnalytics.jsx
import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  BanknotesIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

export default function RevenueAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment/analytics');
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeLabel = (type) => {
    const labels = {
      listing: 'Listing Fees',
      inspection: 'Inspection Fees',
      boost: 'Boost Payments'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-t-blue-600 border-solid rounded-full animate-spin"></div>
        <p className="mt-2">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center text-gray-500">
        Failed to load analytics
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Revenue Analytics</h2>
        <button
          onClick={fetchAnalytics}
          className="text-sm text-blue-600 hover:underline"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          icon={<BanknotesIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Successful Payments"
          value={analytics.successfulPayments}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Failed Payments"
          value={analytics.failedPayments}
          icon={<XCircleIcon className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Pending Payments"
          value={analytics.pendingPayments}
          icon={<ClockIcon className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      {/* Revenue by Type */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Revenue by Payment Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.revenueByType.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50"
            >
              <h4 className="font-medium text-gray-700 mb-2">
                {getTypeLabel(item._id)}
              </h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">
                {formatCurrency(item.total)}
              </p>
              <p className="text-sm text-gray-600">
                {item.count} transaction{item.count !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
        {analytics.recentPayments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent payments</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                    User
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                    Type
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                    Property
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">
                    Amount
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
                {analytics.recentPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">{payment.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{payment.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {getTypeLabel(payment.type)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {payment.property?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">Payment Success Rate</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${
                    analytics.successfulPayments + analytics.failedPayments > 0
                      ? (analytics.successfulPayments /
                          (analytics.successfulPayments + analytics.failedPayments)) *
                        100
                      : 0
                  }%`
                }}
              ></div>
            </div>
          </div>
          <span className="text-sm font-medium">
            {analytics.successfulPayments + analytics.failedPayments > 0
              ? Math.round(
                  (analytics.successfulPayments /
                    (analytics.successfulPayments + analytics.failedPayments)) *
                    100
                )
              : 0}
            %
          </span>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};