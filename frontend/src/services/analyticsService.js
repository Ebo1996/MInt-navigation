import API from "./api";

export const analyticsService = {
  // Get overview dashboard data
  getOverview: async (days = 30) => {
    try {
      const { data } = await API.get("/analytics/overview", {
        params: { days },
      });
      return data.data;
    } catch (error) {
      console.error("Error fetching overview:", error);
      throw error;
    }
  },

  // Get department rankings
  getRankings: async (params = {}) => {
    try {
      const { data } = await API.get("/analytics/rankings", { params });
      return data.data;
    } catch (error) {
      console.error("Error fetching rankings:", error);
      throw error;
    }
  },

  // Get department analytics by ID
  getDepartmentAnalytics: async (id) => {
    try {
      const { data } = await API.get(`/analytics/department/${id}`);
      return data.data;
    } catch (error) {
      console.error("Error fetching department analytics:", error);
      throw error;
    }
  },

  // Get inbox feedback with filters
  getInbox: async (params = {}) => {
    try {
      const { data } = await API.get("/analytics/inbox", { params });
      return data;
    } catch (error) {
      console.error("Error fetching inbox:", error);
      throw error;
    }
  },

  // Generate report
  generateReport: async (reportData) => {
    try {
      const { data } = await API.post("/analytics/report", reportData);
      return data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  },

  // Respond to feedback
  respondToFeedback: async (id, response) => {
    try {
      const { data } = await API.put(`/feedback/${id}/respond`, { response });
      return data;
    } catch (error) {
      console.error("Error responding to feedback:", error);
      throw error;
    }
  },

  // Add a threaded reply (analyst reply visible to sector manager)
  addReply: async (id, text) => {
    try {
      const { data } = await API.post(`/feedback/${id}/reply`, { text });
      return data;
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  },

  // Assign feedback to analyst
  assignFeedback: async (feedbackId, analystId) => {
    try {
      const { data } = await API.put(
        `/analytics/feedback/${feedbackId}/assign`,
        { analystId },
      );
      return data;
    } catch (error) {
      console.error("Error assigning feedback:", error);
      throw error;
    }
  },

  // Get feedback statistics
  getFeedbackStats: async () => {
    try {
      const { data } = await API.get("/feedback/stats");
      return data;
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      throw error;
    }
  },

  // Get feedback by ID
  getFeedbackById: async (id) => {
    try {
      const { data } = await API.get(`/feedback/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching feedback by ID:", error);
      throw error;
    }
  },

  // Update feedback
  updateFeedback: async (id, feedbackData) => {
    try {
      const { data } = await API.put(`/feedback/${id}`, feedbackData);
      return data;
    } catch (error) {
      console.error("Error updating feedback:", error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      const { data } = await API.delete(`/feedback/${id}`);
      return data;
    } catch (error) {
      console.error("Error deleting feedback:", error);
      throw error;
    }
  },

  // Bulk delete feedback
  bulkDeleteFeedback: async (ids) => {
    try {
      const { data } = await API.delete("/feedback/bulk", { data: { ids } });
      return data;
    } catch (error) {
      console.error("Error bulk deleting feedback:", error);
      throw error;
    }
  },

  // Get feedback analytics (trends)
  getFeedbackAnalytics: async (params = {}) => {
    try {
      const { data } = await API.get("/feedback/analytics", { params });
      return data;
    } catch (error) {
      console.error("Error fetching feedback analytics:", error);
      throw error;
    }
  },

  // Send performance alert to a department head / sector manager
  sendAlert: async (sectorId, message, departmentName, rating, responseRate, departmentId = null) => {
    try {
      const { data } = await API.post("/sector/alerts/send", {
        sectorId,
        departmentId,
        message,
        departmentName,
        rating,
        responseRate,
      });
      return data;
    } catch (error) {
      console.error("Error sending alert:", error);
      throw error;
    }
  },

  // Get sector manager alerts
  getMyAlerts: async () => {
    try {
      const { data } = await API.get("/sector/alerts/my");
      return data;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw error;
    }
  },

  // Mark alert as read
  markAlertRead: async (alertId) => {
    try {
      const { data } = await API.put(`/sector/alerts/${alertId}/read`);
      return data;
    } catch (error) {
      console.error("Error marking alert read:", error);
      throw error;
    }
  },

  // Mark all alerts read
  markAllAlertsRead: async () => {
    try {
      const { data } = await API.put("/sector/alerts/read-all");
      return data;
    } catch (error) {
      console.error("Error marking all alerts read:", error);
      throw error;
    }
  },

  // Export feedback data
  exportFeedback: async (params = {}, format = "csv") => {
    try {
      const { data } = await API.get("/feedback/export", {
        params: { ...params, format },
        responseType: "blob",
      });
      return data;
    } catch (error) {
      console.error("Error exporting feedback:", error);
      throw error;
    }
  },
};
