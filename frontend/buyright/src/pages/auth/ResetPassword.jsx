import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
  

    const submit = async () => {
      await api.post(`/auth/resetPassword/${token}`, { password });
      toast.success('Password reset successful');
    };
  
    return (
      <>
  <div className='min-h-screen bg-gray-200 '>
    <h3 className='flex justify-center items-center mb-4 text-3xl text-blue-700'>Reset Your Password</h3>
        <div className='flex flex-col'>
          <label htmlFor="password">New Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <label htmlFor="confirm password">Confirm Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={submit}>Reset Password</button>
        </div>  
        </div>
      </>
    );
  }
  