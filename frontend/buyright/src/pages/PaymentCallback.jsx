// src/pages/PaymentCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {verifyPayment} from '../Utils/Property'; 
import api from '../lib/axios';
import { toast } from 'react-hot-toast';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);


  useEffect(() => {
    handlerVerifyPayment();
  }, []);

  const handlerVerifyPayment = async () => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const paymentRef = reference || trxref;
    
    if (!paymentRef) {
      toast.error('Invalid payment reference');
      navigate('/MyListings');
      return;
    }

    try {
      const res = await api.get(`/payment/verify/${paymentRef}`);
      
      if (res.data.success) {
        setStatus('success');
        setPaymentDetails(res.data.payment);

        toast.success('Payment successful!');
        setTimeout(() => navigate('/MyListings'), 3000);
      } else {
        setStatus('failed');
        toast.error(res.data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setStatus('error');
      const errorMessage = err.response?.data?.message || 'Payment verification failed';  
      toast.error('errorMessage');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-t-blue-600 border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-lg">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your listing has been boosted successfully.
            </p>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">
              Something went wrong. Please try again.
            </p>
          </>
        )}

        <button
          onClick={() => navigate('/MyListings')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Go to My Listings
        </button>
      </div>
    </div>
  );
}