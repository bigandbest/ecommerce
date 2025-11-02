const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://big-best-backend.vercel.app/api";

export const notificationService = {
  getUserNotifications: async (userId, limit = 20, unreadOnly = false) => {
    try {
      const url = `${API_BASE_URL}/notifications/user/${userId}?limit=${limit}&unread_only=${unreadOnly}`;
      const response = await fetch(url);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          notifications: [],
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: error.message, notifications: [] };
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const url = `${API_BASE_URL}/notifications/unread-count/${userId}`;
      const response = await fetch(url);

      if (!response.ok) {
        return {
          success: false,
          unread_count: 0,
          error: `HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Network error in getUnreadCount:", error);
      return { success: false, unread_count: 0, error: error.message };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/read/${notificationId}`,
        {
          method: "PUT",
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: error.message };
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/read-all/${userId}`,
        {
          method: "PUT",
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return { success: false, error: error.message };
    }
  },
};
