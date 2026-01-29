import { useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
  
    const submit = async () => {
      await api.post('/auth/forgotPassword', { email });
      toast.success('Reset link sent');
    };
  
    return (
      <>
  <div className='min-h-screen bg-zinc-100 flex justify-center items-center  p-8 '>
    
        <div className='w-full max-w-md bg-blue-200 p-8 rounded shadow-md'>
        <h3 className='flex justify-center items-center mb-4 text-3xl text-blue-700'>Forgot Your Password</h3>
        <input placeholder='Enter your email' value={email} onChange={e => setEmail(e.target.value)}
        className='w-full mx-auto mb-3 p-3' />
        <button onClick={submit} className='w-full mx-auto bg-blue-500 text-white py-2 rounded'>Send Reset Link</button>
        </div>
        </div>
      </>
    );
  }
  