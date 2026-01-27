// src/hooks/useAuth.js
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const useAuth = (requiredRoles = []) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      toast.error('Access denied');
      navigate('/'); // or buyer dashboard
    }
  }, [user, navigate, requiredRoles]);
};