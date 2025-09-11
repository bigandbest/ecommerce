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

  return (
    <div className="max-w-md mx-auto top-0 mt-[-42px] bg-white shadow-md p-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notification</h2>
        {unread.size > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-500 font-medium hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const hasReadMore = notif.description.split(" ").length > 12;

            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 border-b pb-3 last:border-none cursor-pointer ${
                  unread.has(notif.id) ? "bg-purple-50" : ""
                }`}
                onClick={() => handleNotificationClick(notif.id, hasReadMore)}
              >
                {/* Notification image or icon */}
                {notif.image_url ? (
                  <img
                    src={notif.image_url}
                    alt="notif"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    🔔
                  </div>
                )}

                <div className="flex-1">
                  <h3
                    className={`text-sm font-semibold ${
                      unread.has(notif.id) ? "text-purple-700" : "text-gray-800"
                    }`}
                  >
                    {notif.heading}
                  </h3>

                  <p className="text-xs text-gray-600 text-justify">
                    {expanded[notif.id]
                      ? notif.description
                      : truncateText(notif.description)}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="block text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>

                    {hasReadMore && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent parent click
                          toggleExpand(notif.id);
                        }}
                        className="text-blue-500 text-xs"
                        style={{ minHeight: "10px" }}
                      >
                        {expanded[notif.id] ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
