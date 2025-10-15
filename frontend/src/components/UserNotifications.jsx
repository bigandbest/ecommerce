import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  ActionIcon,
  Select,
  TextInput,
  ScrollArea,
  Loader,
  Center,
  Alert,
  Card,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  // Fetch user notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Try localhost first, then deployed server
      const servers = [
        "http://localhost:8000",
        "https://ecommerce-backend-umber.vercel.app",
      ];

      let response = null;
      for (const server of servers) {
        try {
          response = await axios.get(
            `${server}/api/notifications/user/${currentUser.id}`
          );
          break;
        } catch (err) {
          if (server === servers[servers.length - 1]) throw err;
        }
      }

      if (response?.data?.success) {
        const notifications = response.data.notifications || [];
        setNotifications(notifications);
        setUnreadCount(notifications.filter((n) => !n.is_read).length);
      }
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const servers = [
        "http://localhost:8000",
        "https://ecommerce-backend-umber.vercel.app",
      ];

      for (const server of servers) {
        try {
          await axios.put(`${server}/api/notifications/read/${id}`);
          break;
        } catch (err) {
          if (server === servers[servers.length - 1]) throw err;
        }
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser?.id) return;

    try {
      const servers = [
        "http://localhost:8000",
        "https://ecommerce-backend-umber.vercel.app",
      ];

      for (const server of servers) {
        try {
          await axios.put(
            `${server}/api/notifications/read-all/${currentUser.id}`
          );
          break;
        } catch (err) {
          if (server === servers[servers.length - 1]) throw err;
        }
      }

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.is_read) ||
      (filter === "orders" && notification.related_type === "order") ||
      (filter === "returns" && notification.related_type === "return") ||
      (filter === "refunds" && notification.related_type === "refund") ||
      (filter === "products" && notification.related_type === "product");

    const matchesSearch =
      !searchQuery ||
      notification.heading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCartIcon style={{ color: "#1976d2" }} />;
      case "return":
        return <LocalShippingIcon style={{ color: "#f57c00" }} />;
      case "refund":
        return <AttachMoneyIcon style={{ color: "#388e3c" }} />;
      case "product":
        return <AssignmentIcon style={{ color: "#7b1fa2" }} />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Format date
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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Please log in to view your notifications.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Group sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Group>
            <Title variant="h4">My Notifications</Title>
            {unreadCount > 0 && (
              <Badge color="error" badgeContent={unreadCount} />
            )}
          </Group>
          <Group>
            <ActionIcon onClick={fetchNotifications} disabled={loading}>
              <RefreshIcon />
            </ActionIcon>
            {unreadCount > 0 && (
              <Button
                startIcon={<CheckIcon />}
                variant="outlined"
                size="small"
                onClick={markAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </Group>
        </Group>

        {/* Filters */}
        <Paper sx={{ p: 2 }}>
          <Group sx={{ gap: 2 }}>
            <TextInput
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              sx={{ flex: 1 }}
            />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              displayEmpty
              sx={{ minWidth: 150 }}
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="orders">Orders</option>
              <option value="returns">Returns</option>
              <option value="refunds">Refunds</option>
              <option value="products">Products</option>
            </Select>
          </Group>
        </Paper>

        {/* Error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Notifications List */}
        <ScrollArea style={{ height: 600 }}>
          <Stack spacing={1}>
            {filteredNotifications.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Stack spacing={2} alignItems="center">
                  <NotificationsOffIcon sx={{ fontSize: 48, color: "gray" }} />
                  <Text color="textSecondary">
                    {searchQuery || filter !== "all"
                      ? "No notifications match your filters"
                      : "No notifications yet"}
                  </Text>
                </Stack>
              </Paper>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  sx={{
                    p: 2,
                    backgroundColor: notification.is_read
                      ? "transparent"
                      : "#fff3e0",
                    borderLeft: notification.is_read
                      ? "none"
                      : "4px solid #ff9800",
                  }}
                >
                  <Group
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Group sx={{ alignItems: "flex-start", gap: 2, flex: 1 }}>
                      {getNotificationIcon(notification.related_type)}
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Group
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            fontWeight={notification.is_read ? 400 : 600}
                            variant="body2"
                          >
                            {notification.heading}
                          </Text>
                          <Text variant="caption" color="textSecondary">
                            {formatDate(notification.created_at)}
                          </Text>
                        </Group>
                        <Text variant="body2" color="textSecondary">
                          {notification.description}
                        </Text>
                        <Group sx={{ gap: 1 }}>
                          <Badge
                            variant="outlined"
                            size="small"
                            color="primary"
                          >
                            {notification.related_type}
                          </Badge>
                          {notification.related_id && (
                            <Badge
                              variant="outlined"
                              size="small"
                              color="secondary"
                            >
                              #{notification.related_id}
                            </Badge>
                          )}
                        </Group>
                      </Stack>
                    </Group>
                    <Group sx={{ gap: 1 }}>
                      {!notification.is_read && (
                        <ActionIcon
                          size="small"
                          onClick={() => markAsRead(notification.id)}
                          sx={{ color: "primary.main" }}
                        >
                          <CheckIcon fontSize="small" />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>
                </Card>
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Container>
  );
};

export default UserNotifications;
