// src/utils/property.js
import api from '../lib/axios';

// === LISTINGS (Public & Protected) ===
export const getHouses = (config = {}) => api.get('/property/getHouses', config);
export const getHouse = (id) => api.get(`/property/single/${id}`);

// === FAVORITES (Buyer) ===
export const getFavourites = () => api.get('/property/allFavourites');
export const addFavourite = (houseId) => api.post('/property/addFavourite', { houseId });
export const removeFavourite = (houseId) => api.delete('/property/removeFavourite', { data: { houseId } });

// === SELLER: Create & Manage Listings ===
export const createListing = (data) => api.post('/property/createListing', data);
export const editHouse = (id, data) => api.put(`/property/edit/${id}`, data);
export const deleteHouse = (houseId) => api.delete(`/property/deleteHouse/${houseId}`);

// === SELLER: Get My Listings (including pending) ===
export const getMyListing = () => api.get('/property/getMyListing');

// === SELLER: Update Listing Status ===
export const updateListingStatus = (id, status) => 
  api.put(`/property/updateStatus/${id}`, { status });

// === ADMIN: Approve/Reject ===
export const approveListing = (id) => api.put('/property/approveListing', { id });
export const rejectListing = (id) => api.delete('/property/rejectListing', { data: { id } });

// === INQUIRIES ===
export const createInquiry = (data) => api.post('/inquiry/createinquiry', data);
export const respondToInquiry = (id, reply) => api.post(`/inquiry/response/${id}`, { reply });
export const MyInquiries = () => api.get('/inquiry/my-inquiries');
export const getSellerInquiries = () => api.get('/inquiry/sellerinquiries');
export const getInquiryById = (id) => api.get(`/inquiry/getInquiry/${id}`);
export const getAllInquiries = () => api.get('/inquiry/allinquiries');

// === PAYMENTS ===
export const payListingFee = (propertyId) => api.post(`/payment/listing/${propertyId}`);
export const payInspectionFee = (propertyId) => api.post(`/payment/inspection/${propertyId}`);
export const boostListing = (propertyId, days) => api.post(`/payment/boost/${propertyId}`, { days });
export const initializePayment = (paymentId) => api.post(`/payment/initialize/${paymentId}`);
export const verifyPayment = (reference) => api.get(`/payment/verify/${reference}`);
export const getPaymentHistory = () => api.get('/payment/history');   
  