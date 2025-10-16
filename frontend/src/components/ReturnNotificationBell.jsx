import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Cancel,
  Refresh,
} from "@mui/icons-material";
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
      return <CheckCircle sx={{ color: "green", fontSize: 20 }} />;
    }
    if (notification.heading?.toLowerCase().includes("rejected")) {
      return <Cancel sx={{ color: "red", fontSize: 20 }} />;
    }
    return <Refresh sx={{ color: "blue", fontSize: 20 }} />;
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

  return (
    <>
      <IconButton onClick={handleClick} sx={{ color: "inherit" }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ width: 350, maxHeight: 400, overflow: "auto" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Typography variant="h6">Return Notifications</Typography>
          </Box>

          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="textSecondary">
                No return notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: notification.is_read
                      ? "transparent"
                      : "#fff3e0",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                  onClick={() =>
                    !notification.is_read && markAsRead(notification.id)
                  }
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      width: "100%",
                      gap: 1,
                    }}
                  >
                    {getNotificationIcon(notification)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={notification.is_read ? 400 : 600}
                        sx={{ mb: 0.5 }}
                      >
                        {notification.heading}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: "block", mb: 1 }}
                      >
                        {notification.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          {formatTimeAgo(notification.created_at)}
                        </Typography>
                        {notification.related_id && (
                          <Chip
                            label={`#${notification.related_id.slice(0, 8)}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default ReturnNotificationBell;
