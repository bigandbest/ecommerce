import React, { useEffect, useState } from "react";
import { useNotifications } from "../../contexts/NotificationContext";

export default function Notifications() {
  const { notifications, unread, markAsRead, markAllAsRead, fetchNotifications } =
    useNotifications();
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Toggle expand/collapse for a specific notification
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    markAsRead(id); // mark as read when opened
  };

  // Mark as read when clicking on a notification without "Read more"
  const handleNotificationClick = (id, hasReadMore) => {
    if (!hasReadMore) {
      markAsRead(id);
    }
  };

  // Function to truncate text
  const truncateText = (text, wordLimit = 12) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  // Get notification icon based on type
  const getNotificationIcon = (heading) => {
    if (heading.toLowerCase().includes('cancellation')) {
      return (
        <div className="w-7 h-7 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    if (heading.toLowerCase().includes('return')) {
      return (
        <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
      );
    }
    if (heading.toLowerCase().includes('approved') || heading.toLowerCase().includes('completed')) {
      return (
        <div className="w-7 h-7 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-sm">
        <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    );
  };

  // Format date to relative time
  const formatRelativeTime = (dateString) => {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unread.size > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                {unread.size}
              </span>
            )}
          </div>
          {unread.size > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-white/90 hover:text-white font-medium hover:underline transition-colors flex-shrink-0"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>



      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const hasReadMore = notif.description.split(" ").length > 12;
              const isUnread = unread.has(notif.id);

              return (
                <div
                  key={notif.id}
                  className={`p-2.5 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 ${
                    isUnread ? "bg-orange-50 border-orange-400" : "border-transparent"
                  }`}
                  onClick={() => handleNotificationClick(notif.id, hasReadMore)}
                >
                  <div className="flex items-start gap-2">
                    {/* Notification Icon */}
                    {notif.image_url ? (
                      <img
                        src={notif.image_url}
                        alt="notification"
                        className="w-7 h-7 rounded-full object-cover shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notif.heading)}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <h3 className={`text-sm font-semibold leading-tight flex-1 min-w-0 ${
                          isUnread ? "text-gray-900" : "text-gray-700"
                        }`}>
                          {notif.heading}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(notif.created_at)}
                          </span>
                          {isUnread && (
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-tight">
                        {expanded[notif.id]
                          ? notif.description
                          : truncateText(notif.description)}
                      </p>

                      {hasReadMore && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(notif.id);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-1 transition-colors"
                        >
                          {expanded[notif.id] ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">We'll notify you when something happens</p>
          </div>
        )}
      </div>
    </div>
  );
}