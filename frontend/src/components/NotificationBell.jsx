"use client";
import { useState, useEffect, useRef } from "react";
import { notificationService } from "@/services/notificationService";
import NotificationPanel from "./NotificationPanel";

const NotificationBell = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [userId]);

  // Prevent multiple calls by debouncing
  useEffect(() => {
    let timeoutId;
    if (userId) {
      timeoutId = setTimeout(() => {
        fetchUnreadCount();
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const result = await notificationService.getUnreadCount(userId);
      if (result.success) {
        setUnreadCount(result.unread_count || 0);
      } else {
        console.warn("Failed to fetch unread count:", result.error);
        setUnreadCount(0);
      }
    } catch (error) {
      console.warn("Error in fetchUnreadCount:", error);
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.getUserNotifications(userId, 10);
      if (result.success) {
        setNotifications(result.notifications || []);
      } else {
        console.warn("Failed to fetch notifications:", result.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
      setNotifications([]);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await notificationService.markAsRead(notificationId);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await notificationService.markAllAsRead(userId);
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const formatDate = (dateString) => {
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return "🛍️";
      case "return":
        return "↩️";
      case "refund":
        return "💰";
      case "product":
        return "📦";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-[#F8F8FA] rounded-full cursor-pointer hover:shadow-md transition-all relative"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 19V20H3V19L5 17V11C5 7.9 7.03 5.17 10 4.29C10 4.19 10 4.1 10 4C10 2.9 10.9 2 12 2C13.1 2 14 2.9 14 4C14 4.1 14 4.19 14 4.29C16.97 5.17 19 7.9 19 11V17L21 19ZM12 22C10.9 22 10 21.1 10 20H14C14 21.1 13.1 22 12 22Z"
            fill="#666"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div>Loading...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-3xl mb-3 opacity-50">🔔</div>
                <div className="font-medium">No notifications yet</div>
                <div className="text-xs mt-1">You're all caught up!</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 cursor-pointer transition-all duration-200 ${
                    !notification.is_read
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() =>
                    !notification.is_read && handleMarkAsRead(notification.id)
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm shadow-sm">
                      {getNotificationIcon(notification.related_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4
                          className={`text-sm ${
                            !notification.is_read
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          } truncate pr-2`}
                        >
                          {notification.heading}
                        </h4>
                        <span className="text-xs text-gray-400 flex-shrink-0 bg-gray-100 px-2 py-0.5 rounded-full">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                          <span className="text-xs text-gray-400 capitalize">
                            {notification.related_type?.replace("_", " ")}
                          </span>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 text-center">
              <button
                onClick={() => {
                  setShowPanel(true);
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}

      <NotificationPanel
        userId={userId}
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
      />
    </div>
  );
};

export default NotificationBell;
