import { useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async () => {
      if(!password || !confirmPassword){
        toast.error('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      try {
        setLoading(true);
        await api.post(`/auth/resetPassword/${token}`, { password });
      toast.success('Password reset successful');
        navigate('/login');
      } catch (error) {
        console.error('Reset Password Error:', error);
        toast.error(error.response?.data?.message || 'Password reset failed');
      }finally {
        setLoading(false);
      }
    };
  
    return (
      <>
  <div className=' min-h-screen bg-zinc-100 flex items-center justify-center p-10 rounded-lg '>
   
        <div className='w-full max-w-md bg-blue-500 p-8 rounded shadow-md'>
        <h3 className='flex justify-center items-center mb-4 text-2xl font-semibold text-center  text-white'>Reset Your Password</h3>
         
        <input
          type="password"
          name='password'
          className='mb-2 border-rounded focus:outline-none focus-ring-blue-500 w-[70%] p-2'
          placeholder='Enter New Password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
       
        <input
        className='mb-2 border-rounded focus:outline-none focus-ring-blue-500 w-[70%] p-2'
          type="password"
          name='confirm password'
          placeholder='Confirm New Password'
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button 
        className='bg-green-500 hover:bg-green-600 transition text-white py-2 px-4 rounded mt-4 '
          disabled={loading}
          
        onClick={submit}>Reset Password</button>
        </div>

        </div>
      </>
    );
    }
  ;