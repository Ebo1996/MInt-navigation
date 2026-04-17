import api from "../api/api";

export const submitFeedback = async (payload) => {
  const response = await api.post("/feedback", payload);
  return response.data?.feedback;
};

export const getDepartmentFeedback = async (departmentId) => {
  const response = await api.get(`/feedback/department/${departmentId}`);
  return response.data?.feedback || [];
};

export const getAllFeedback = async () => {
  const response = await api.get("/feedback/all");
  return response.data?.feedback || [];
};

export const respondToFeedback = async (id, responseText) => {
  const response = await api.put(`/feedback/respond/${id}`, { response: responseText });
  return response.data?.feedback;
};

export const getFeedbackAnalyticsSummary = async () => {
  const response = await api.get("/feedback/analytics/summary");
  return response.data?.analytics;
};
