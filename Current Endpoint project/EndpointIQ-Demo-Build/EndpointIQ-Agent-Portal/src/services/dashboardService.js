import api from "./api";

export const getSummary = async () => {
  const response = await api.get("/summary");
  return response.data;
};

export const getDevices = async () => {
  const response = await api.get("/devices");
  return response.data;
};

export const getHealth = async () => {
  const response = await api.get("/device-health");
  return response.data;
};

export const getRecommendations = async () => {
  const response = await api.get("/recommendations");
  return response.data;
};