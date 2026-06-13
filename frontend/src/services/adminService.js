import API from "./api";

export const adminService = {
  login: async (credentials) => {
    try {
      const { data } = await API.post("/admin/login", credentials);
      return data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const { data } = await API.get("/admin/profile");
      return data;
    } catch (error) {
      console.error(
        "Get profile error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await API.put("/admin/profile", profileData);
      return data;
    } catch (error) {
      console.error(
        "Update profile error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  logout: async () => {
    try {
      const { data } = await API.post("/admin/logout");
      return data;
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
      throw error;
    }
  },
};
