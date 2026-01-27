import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Logged in!');
      const role = res.data.user.role;
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'seller') navigate('/dashboard/seller');
      else navigate('/dashboard/buyer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-2xl text-blue-600 font-bold text-center">Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate('/auth/forgotPassword')}
            className="text-blue-500 hover:underline text-sm"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
