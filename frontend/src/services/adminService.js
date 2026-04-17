import api from "../api/api";

export const getSystemStatus = async () => {
  const response = await api.get("/admin/system-status");
  return response.data?.status;
};

export const getSlaOverview = async (slaHours = 24) => {
  const response = await api.get(`/admin/sla?slaHours=${slaHours}`);
  return {
    slaHours: response.data?.slaHours || slaHours,
    overdueCount: response.data?.overdueCount || 0,
    overdueItems: response.data?.overdueItems || []
  };
};

export const assignSlaFeedback = async (feedbackId, departmentId) => {
  const response = await api.post(`/admin/sla/${feedbackId}/assign`, { departmentId });
  return response.data?.feedback;
};

export const followUpSlaFeedback = async (feedbackId, note = "") => {
  const response = await api.post(`/admin/sla/${feedbackId}/follow-up`, { note });
  return response.data?.feedback;
};

export const getDepartmentHealth = async () => {
  const response = await api.get("/admin/department-health");
  return response.data?.health || [];
};

export const getAuditLogs = async (page = 1, limit = 20) => {
  const response = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
  return {
    items: response.data?.items || [],
    pagination: response.data?.pagination || { page, limit, total: 0 }
  };
};

export const exportAdminReport = async (type, format = "csv") => {
  const response = await api.get(`/admin/export/${type}?format=${format}`, { responseType: "blob" });
  const mime = format === "pdf" ? "application/pdf" : "text/csv";
  const blob = new Blob([response.data], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${type}-report.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const updateUserByAdmin = async (userId, payload) => {
  const response = await api.patch(`/auth/users/${userId}`, payload);
  return response.data?.user;
};
