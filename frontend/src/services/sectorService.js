import API from "./api";
import { cache } from "./cache";

export const sectorService = {
  // ============= SECTOR MANAGER PORTAL METHODS =============

  // Get sector statistics
  getStats: async (sectorId) => {
    try {
      const { data } = await API.get(`/sector/${sectorId}/stats`);
      return data.data;
    } catch (error) {
      console.error("Error fetching sector stats:", error);
      throw error;
    }
  },

  // Get sector feedback with filters
  getFeedback: async (sectorId, params = {}) => {
    try {
      const { data } = await API.get(`/sector/${sectorId}/feedback`, {
        params,
      });
      return data;
    } catch (error) {
      console.error("Error fetching sector feedback:", error);
      throw error;
    }
  },

  // Get pending count for notifications
  getPendingCount: async (sectorId) => {
    try {
      const { data } = await API.get(`/sector/${sectorId}/pending-count`);
      return data.pendingCount;
    } catch (error) {
      console.error("Error fetching pending count:", error);
      return 0;
    }
  },

  // Respond to feedback
  respondToFeedback: async (feedbackId, response) => {
    try {
      const { data } = await API.put(`/sector/feedback/${feedbackId}/respond`, {
        response,
      });
      return data;
    } catch (error) {
      console.error("Error responding to feedback:", error);
      throw error;
    }
  },

  // Resolve feedback
  resolveFeedback: async (feedbackId) => {
    try {
      const { data } = await API.put(`/sector/feedback/${feedbackId}/resolve`);
      return data;
    } catch (error) {
      console.error("Error resolving feedback:", error);
      throw error;
    }
  },

  // Export CSV
  exportCSV: async (sectorId) => {
    try {
      const response = await API.get(`/sector/${sectorId}/export/csv`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting CSV:", error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const { data } = await API.put("/sector/profile/update", profileData);
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const { data } = await API.put(
        "/sector/profile/change-password",
        passwordData,
      );
      return data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // ============= ADMIN SECTOR CRUD METHODS (with FormData support) =============

  // Get all sectors (admin - includes inactive)
  getAllSectors: async () => {
    try {
      const { data } = await API.get("/sectors/admin/all");
      return data.data || data;
    } catch (error) {
      console.error("Error fetching all sectors:", error);
      throw error;
    }
  },

  // Get single sector by ID (admin)
  getSectorById: async (id) => {
    try {
      const { data } = await API.get(`/sectors/admin/${id}`);
      return data.data;
    } catch (error) {
      console.error("Error fetching sector:", error);
      throw error;
    }
  },

  // Create new sector (with image upload support)
  createSector: async (sectorData) => {
    try {
      const { data } = await API.post("/sectors/admin", sectorData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    } catch (error) {
      console.error("Error creating sector:", error);
      throw error;
    }
  },

  // Update sector (with image upload support)
  updateSector: async (id, sectorData) => {
    try {
      const { data } = await API.put(`/sectors/admin/${id}`, sectorData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    } catch (error) {
      console.error("Error updating sector:", error);
      throw error;
    }
  },

  // Delete sector (admin)
  deleteSector: async (id) => {
    try {
      const { data } = await API.delete(`/sectors/admin/${id}`);
      return data;
    } catch (error) {
      console.error("Error deleting sector:", error);
      throw error;
    }
  },

  // Toggle sector status (activate/deactivate)
  toggleSectorStatus: async (id) => {
    try {
      const { data } = await API.patch(`/sectors/admin/${id}/toggle`);
      return data.data;
    } catch (error) {
      console.error("Error toggling sector status:", error);
      throw error;
    }
  },

  // Get sector statistics for dashboard
  getSectorStats: async () => {
    try {
      const { data } = await API.get("/sectors/stats");
      return data.data;
    } catch (error) {
      console.error("Error fetching sector stats:", error);
      throw error;
    }
  },

  // ============= PUBLIC SECTOR METHODS (for Home.jsx & Sector.jsx) =============

  // Get all active sectors (for public home page)
  getPublicSectors: async () => {
    try {
      return await cache.fetch("sectors:public", async () => {
        const { data } = await API.get("/sectors");
        return data.data || data;
      });
    } catch (error) {
      console.error("Error fetching public sectors:", error);
      throw error;
    }
  },

  // Get single sector by ID (for public sector page)
  getPublicSectorById: async (id) => {
    try {
      return await cache.fetch(`sectors:public:${id}`, async () => {
        const { data } = await API.get(`/sectors/public/${id}`);
        return data.data;
      });
    } catch (error) {
      console.error("Error fetching public sector:", error);
      throw error;
    }
  },
};
