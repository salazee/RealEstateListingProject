// src/utils/property.js
import API_URL from '../lib/axios';

// === LISTINGS (Public & Protected) ===
export const getHouses = (config = {}) => API_URL.get('/property/getHouses', config);
export const getHouse = (id) => API_URL.get(`/property/single/${id}`);

// === FAVORITES (Buyer) ===
export const getFavourites = () => API_URL.get('/property/allFavourites');
export const addFavourite = (houseId) => API_URL.post('/property/addFavourite', { houseId });
export const removeFavourite = (houseId) => API_URL.delete('/property/removeFavourite', { data: { houseId } });

// === SELLER: Create & Manage Listings ===
export const createListing = (data) => API_URL.post('/property/createListing', data);
export const editHouse = (id, data) => API_URL.put(`/property/edit/${id}`, data);
export const deleteHouse = (houseId) => API_URL.delete(`/property/deleteHouse/${houseId}`);

// === SELLER: Get My Listings (including pending) ===
export const getMyListing = () => API_URL.get('/property/getMyListing');

// === SELLER: Update Listing Status ===
export const updateListingStatus = (id, status) => 
  API_URL.put(`/property/updateStatus/${id}`, { status });

// === ADMIN: API_URLrove/Reject ===
export const API_URLroveListing = (id) => API_URL.put('/property/API_URLroveListing', { id });
export const rejectListing = (id) => API_URL.delete('/property/rejectListing', { data: { id } });

// === INQUIRIES ===
export const createInquiry = (data) => API_URL.post('/inquiry/createinquiry', data);
export const respondToInquiry = (id, reply) => API_URL.post(`/inquiry/response/${id}`, { reply });
export const getBuyerInquiries = () => API_URL.get('/inquiry/my-inquiries');
export const getSellerInquiries = () => API_URL.get('/inquiry/sellerinquiries');
export const getInquiryById = (id) => API_URL.get(`/inquiry/getInquiry/${id}`);
export const getAllInquiries = () => API_URL.get('/inquiry/allinquiries');

// === PAYMENTS ===
export const payListingFee = (propertyId) => API_URL.post(`/payment/listing/${propertyId}`);
export const payInspectionFee = (propertyId) => API_URL.post(`/payment/inspection/${propertyId}`);
export const boostListing = (propertyId, days) => API_URL.post(`/payment/boost/${propertyId}`, { days });
export const initializePayment = (paymentId) => API_URL.post(`/payment/initialize/${paymentId}`);
export const verifyPayment = (reference) => API_URL.get(`/payment/verify/${reference}`);
export const getPaymentHistory = () => API_URL.get('/payment/history');   
  