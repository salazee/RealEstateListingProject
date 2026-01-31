
// src/pages/auth/VerifyEmail.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEmail, resendOtp } from '@/utils/auth';
import { toast } from 'react-hot-toast';

export default function VerifyEmail() {
  const [email, setEmail] = useState(() => localStorage.getItem('verifyEmail') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!email || !otp) {
      toast.error('Please fill in all fields');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    
    try {
      const res = await verifyEmail({ email, otp });
      
      // Only show success toast and redirect to login
      toast.success('Email verified successfully! Please login.');
      
      // Clear any stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      
    } catch (err) {
      console.error('Verification error:', err);
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    try {
      await resendOtp({ email });
      toast.success('New OTP sent to your email!');
    } catch (err) {
      console.error('Resend error:', err);
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleVerify} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md border">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Verify Your Email</h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter the 6-digit code sent to your email
        </p>
        
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 mb-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
          disabled={loading}
        />
        
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setOtp(value);
          }}
          maxLength={6}
          className="w-full p-3 border border-gray-300 mb-4 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center text-2xl tracking-widest"
          required
          disabled={loading}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded font-medium mb-3 transition ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
        
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full text-blue-600 py-2 rounded hover:bg-blue-50 transition font-medium disabled:opacity-50"
        >
          Resend OTP
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already verified?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}