import API from "./api";
export const feedbackService = {
  // Get all feedback with optional filters
  getAll: async (params = {}) => {
    try {
      const { data } = await API.get("/feedback", { params });
      return data;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }
  },
  // Get feedback by department
  getByDepartment: async (deptId) => {
    try {
      const { data } = await API.get("/feedback", {
        params: { department: deptId },
      });
      return data;
    } catch (error) {
      console.error("Error fetching department feedback:", error);
      throw error;
    }
  },
  // Get feedback statistics
  getStats: async () => {
    try {
      const { data } = await API.get("/feedback/stats");
      return data;
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      throw error;
    }
  },
  // Submit new feedback
  create: async (feedbackData) => {
    try {
      const { data } = await API.post("/feedback", feedbackData);
      return data;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  },
  // Respond to feedback (admin only)
  respond: async (id, response) => {
    try {
      const { data } = await API.put(`/feedback/${id}/respond`, { response });
      return data;
    } catch (error) {
      console.error("Error responding to feedback:", error);
      throw error;
    }
  },
  // Delete feedback (admin only)
  delete: async (id) => {
    try {
      const { data } = await API.delete(`/feedback/${id}`);
      return data;
    } catch (error) {
      console.error("Error deleting feedback:", error);
      throw error;
    }
  },
};
