// src/utils/auth.js
import API_URL from '../lib/axios';

export const registerUser = (data) => API_URL.post('/auth/register', data);
export const verifyEmail = (data) => API_URL.post('/auth/verifyemail', data);
export const resendOtp = (data) => API_URL.post('/auth/resend', data);
export const forgotPassword = (data) => API_URL.post('/auth/forgotPassword', data);
export const resetPassword = (token, data) => API_URL.post(`/auth/resetPassword/${token}`, data);
export const loginUser = (data) => API_URL.post('/auth/login', data);
export const logoutUser = () => API_URL.post('/auth/logout');