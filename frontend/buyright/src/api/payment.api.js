import api from "./axios";

export const initializePayment = async (paymentId) => {
  const { data } = await api.post(`/payments/initialize/${paymentId}`);
  return data;
};
