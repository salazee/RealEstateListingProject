import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../Utils/auth';
import { toast } from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword:'', role:''});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await registerUser(form);
      localStorage.setItem('verifyEmail', form.email);
      toast.success('Account created! Check email for OTP.');
      navigate('/verify-email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-2xl text-blue-600 font-bold text-center">Create Account</h2>

        <input name="name" placeholder="Full Name" className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />

        <select name="role" className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} required>
          <option value="" disabled>Select Role</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>

        <button type="submit" className="w-full py-2 rounded bg-blue-500 text-white hover:bg-blue-700 transition">Register</button>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate('/login')}>
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
