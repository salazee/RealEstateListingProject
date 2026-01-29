import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { User, Store } from 'lucide-react';

export default function Login() {
   const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const userRole = res.data.user.role;
            
            if (selectedRole && userRole !== selectedRole && userRole !== 'admin') {
              toast.error(`This account is registered as a ${userRole}, not a ${selectedRole}`);
              return;
            }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Logged in successfully!');

      
      if (userRole === 'admin') navigate('/dashboard/admin');
      else if (userRole === 'seller') navigate('/dashboard/seller');
      else navigate('/dashboard/buyer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };
  
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">How do you want to login?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div
              onClick={() => handleRoleSelect('buyer')}
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Login as Buyer</h2>
                <p className="text-gray-600">
                  Access your account to browse and purchase properties
                </p>
                <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mt-4">
                  Continue as Buyer
                </button>
              </div>
            </div>

            <div
              onClick={() => handleRoleSelect('seller')}
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-green-500"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Store className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Login as Seller</h2>
                <p className="text-gray-600">
                  Access your dashboard to manage your property listings
                </p>
                <button className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition mt-4">
                  Continue as Seller
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md bg-blue-200 p-6 rounded-lg shadow-md space-y-5"
      >
          <div className="text-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-blue-600 hover:underline mb-2"
          >
            ← Change login type
          </button>
          <h2 className="text-3xl font-bold text-gray-800">
            {selectedRole === 'buyer' ? 'Buyer' : 'Seller'} Login
          </h2>
          <div className="mt-2 inline-block">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              selectedRole === 'buyer' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {selectedRole === 'buyer' ? 'Buyer' : 'Seller'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/auth/forgotPassword')}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            selectedRole === 'buyer'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-blue-600 font-semibold hover:underline"
            onClick={() => navigate('/register')}
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
}
