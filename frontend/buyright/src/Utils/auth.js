// src/utils/auth.js
import api from '../lib/axios';

export const registerUser = (data) => api.post('/auth/register', data);
export const verifyEmail = (data) => api.post('/auth/verifyemail', data);
export const resendOtp = (data) => api.post('/auth/resend', data);
export const forgotPassword = (data) => api.post('/auth/forgotPassword', data);
export const resetPassword = (token, data) => api.post(`/auth/resetPassword/${token}`, data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');