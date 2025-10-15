// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(new Set());
  const { currentUser } = useAuth();

  // Load from localStorage on first render and when user changes
  useEffect(() => {
    const storedNotifs =
      JSON.parse(localStorage.getItem("notifications")) || [];
    const storedUnread =
      JSON.parse(localStorage.getItem("unreadNotifications")) || [];
    if (storedNotifs.length > 0) {
      setNotifications(storedNotifs);
      setUnread(new Set(storedUnread));
    }

    // Fetch notifications based on user authentication
    if (currentUser?.id) {
      fetchNotifications(currentUser.id);
    } else {
      fetchNotifications(); // Fetch general notifications if not authenticated
    }
  }, [currentUser]);

  const fetchNotifications = async (userId = null) => {
    try {
      // Try local server first, then fallback to deployed server
      const baseUrls = [
        "http://localhost:8000/api/notifications",
        "https://ecommerce-backend-umber.vercel.app/api/notifications",
      ];

      let url = "";
      let res = null;
      let lastError = null;

      for (const baseUrl of baseUrls) {
        try {
          if (userId) {
            // Use the new user-specific endpoint
            url = `${baseUrl}/user/${userId}`;
          } else {
            // Fallback to general notifications if no user
            url = `${baseUrl}/collect`;
          }

          res = await axios.get(url, { timeout: 5000 });
          break; // Success, exit the loop
        } catch (error) {
          lastError = error;
          console.log(`Failed to fetch from ${baseUrl}, trying next...`);
          continue;
        }
      }

      if (!res) {
        throw lastError || new Error("All notification servers failed");
      }

      const fetched = res.data.notifications || [];

      // Load old localStorage BEFORE overwriting
      const oldStoredNotifs =
        JSON.parse(localStorage.getItem("notifications")) || [];
      const storedUnread =
        JSON.parse(localStorage.getItem("unreadNotifications")) || [];

      const storedUnreadSet = new Set(storedUnread);
      const oldIds = oldStoredNotifs.map((n) => n.id);
      const fetchedIds = fetched.map((n) => n.id);

      // Mark as unread only if it's not in old notifications at all
      fetchedIds.forEach((id) => {
        if (!oldIds.includes(id) && !storedUnreadSet.has(id)) {
          storedUnreadSet.add(id); // new notification → unread
        }
      });

      // Save updated state
      setNotifications(fetched);
      localStorage.setItem("notifications", JSON.stringify(fetched));

      setUnread(storedUnreadSet);
      localStorage.setItem(
        "unreadNotifications",
        JSON.stringify([...storedUnreadSet])
      );
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Mark a single notification as read
  const markAsRead = (id) => {
    setUnread((prev) => {
      const updated = new Set(prev);
      updated.delete(id);
      localStorage.setItem("unreadNotifications", JSON.stringify([...updated]));
      return updated;
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setUnread(new Set());
    localStorage.setItem("unreadNotifications", JSON.stringify([]));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
