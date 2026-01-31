// src/pages/seller/BoostListing.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHouse, boostListing, initializePayment } from '@/utils/Property';
import { toast } from 'react-hot-toast';

export default function BoostListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const BOOST_PRICES = {
    7: 5000,   // ₦5,000 for 7 days
    14: 9000,  // ₦9,000 for 14 days
    30: 15000  // ₦15,000 for 30 days
  };

  useEffect(() => {
    fetchHouse();
  }, [id]);

  const fetchHouse = async () => {
    try {
      const res = await getHouse(id);
      setHouse(res.data.getHouse);
    } catch (error) {
      toast.error('Failed to load listing', error);
      navigate('/MyListings');
    } finally {
      setLoading(false);
    }
  };

  const handleBoost = async () => {
    setProcessing(true);
    try {
      // Create boost payment
      const res = await boostListing(id, days);
      const paymentId = res.data.paymentId;
      
      // Initialize Paystack payment
      const initRes = await initializePayment(paymentId);
      const authorizationUrl = initRes.data.authorization_url;
      
      // Redirect to Paystack
      window.location.href = authorizationUrl;
    } catch (err) {
      console.error('Boost error:', err);
      toast.error(err.response?.data?.message || 'Payment initialization failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!house) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">Boost Your Listing</h1>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <img
            src={house.images?.[0] || 'https://via.placeholder.com/100'}
            alt={house.name}
            className="w-20 h-20 object-cover rounded mr-4"
          />
          <div>
            <h3 className="font-bold">{house.name}</h3>
            <p className="text-gray-600 text-sm">{house.location}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-4">
          Boost your listing to appear at the top of search results and get more views!
        </p>

        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              value="7"
              checked={days === 7}
              onChange={() => setDays(7)}
              className="mr-3"
            />
            <div className="flex-1">
              <span className="font-medium">7 Days</span>
              <span className="text-gray-600 text-sm ml-2">- Most Popular</span>
            </div>
            <span className="font-bold">₦{BOOST_PRICES[7].toLocaleString()}</span>
          </label>

          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              value="14"
              checked={days === 14}
              onChange={() => setDays(14)}
              className="mr-3"
            />
            <div className="flex-1">
              <span className="font-medium">14 Days</span>
              <span className="text-gray-600 text-sm ml-2">- Save 10%</span>
            </div>
            <span className="font-bold">₦{BOOST_PRICES[14].toLocaleString()}</span>
          </label>

          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              value="30"
              checked={days === 30}
              onChange={() => setDays(30)}
              className="mr-3"
            />
            <div className="flex-1">
              <span className="font-medium">30 Days</span>
              <span className="text-gray-600 text-sm ml-2">- Best Value</span>
            </div>
            <span className="font-bold">₦{BOOST_PRICES[30].toLocaleString()}</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/MyListings')}
          className="flex-1 px-4 py-3 border border-gray-300 rounded hover:bg-gray-50"
          disabled={processing}
        >
          Cancel
        </button>
        <button
          onClick={handleBoost}
          disabled={processing}
          className={`flex-1 px-4 py-3 rounded font-medium ${
            processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {processing ? 'Processing...' : `Pay ₦${BOOST_PRICES[days].toLocaleString()}`}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h4 className="font-medium mb-2">✨ Benefits of Boosting:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Appear at the top of search results</li>
          <li>• Get 3x more views on average</li>
          <li>• Highlighted with a special badge</li>
          <li>• Increased inquiry rate</li>
        </ul>
      </div>
    </div>
  );
}