import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const ReturnNotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser } = useAuth();

  const fetchReturnNotifications = async () => {
    if (!currentUser?.id) return;

    try {
      console.log("🔔 Fetching return notifications for user:", currentUser.id);
      const servers = [
        "http://localhost:8000",
        "https://ecommerce-8342.onrender.com",
      ];

      let response = null;
      for (const server of servers) {
        try {
          const url = `${server}/api/notifications/user/${currentUser.id}?limit=20`;
          console.log("🔔 Trying URL:", url);
          response = await axios.get(url);
          console.log("🔔 Response from server:", server, response.data);
          break;
        } catch (err) {
          console.log("🔔 Server failed:", server, err.message);
          if (server === servers[servers.length - 1]) throw err;
        }
      }

      if (response?.data?.success) {
        const allNotifications = response.data.notifications || [];
        console.log("🔔 All notifications received:", allNotifications);

        // Filter for return-related notifications with more comprehensive filtering
        const returnNotifications = allNotifications.filter((n) => {
          const isReturnRelated =
            n.related_type === "return" ||
            n.related_type === "return_order" ||
            n.related_type === "cancel_request" ||
            n.heading?.toLowerCase().includes("return") ||
            n.heading?.toLowerCase().includes("cancel") ||
            n.heading?.toLowerCase().includes("refund") ||
            n.description?.toLowerCase().includes("return") ||
            n.description?.toLowerCase().includes("cancel") ||
            n.description?.toLowerCase().includes("refund");

          console.log(
            "🔔 Checking notification:",
            n.heading,
            "isReturnRelated:",
            isReturnRelated
          );
          return isReturnRelated;
        });

        console.log("🔔 Filtered return notifications:", returnNotifications);
        setNotifications(returnNotifications);
        setUnreadCount(returnNotifications.filter((n) => !n.is_read).length);
      }
    } catch (error) {
      console.error("🔔 Error fetching return notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const servers = [
        "http://localhost:8000",
        "https://ecommerce-8342.onrender.com",
      ];

      for (const server of servers) {
        try {
          await axios.put(`${server}/api/notifications/read/${notificationId}`);
          break;
        } catch (err) {
          if (server === servers[servers.length - 1]) throw err;
        }
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.heading?.toLowerCase().includes("approved")) {
      return (
        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (notification.heading?.toLowerCase().includes("rejected")) {
      return (
        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    );
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchReturnNotifications();

    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchReturnNotifications, 10000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleClose}
          ></div>
          
          {/* Popover Content */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Return Notifications</h3>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm text-gray-500">
                    No return notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const isUnread = !notification.is_read;
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                          isUnread ? "bg-orange-50 border-l-2 border-orange-400" : ""
                        }`}
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`text-sm leading-tight ${
                                isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                              }`}>
                                {notification.heading}
                              </h4>
                              {isUnread && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-600 leading-relaxed mb-2">
                              {notification.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                              {notification.related_id && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  #{notification.related_id.slice(0, 8)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReturnNotificationBell;
