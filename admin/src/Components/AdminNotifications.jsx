import { useState, useEffect } from "react";
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
} from "@mantine/core";
import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconX,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconShoppingCart,
  IconCurrencyRupee,
  IconPackage,
} from "@tabler/icons-react";
import { supabase } from "../../../config/supabaseClient";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch admin notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or("notification_type.eq.admin,user_id.is.null")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

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
    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in("id", unreadIds);

      if (error) throw error;

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

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const wasUnread =
        notifications.find((n) => n.id === id)?.is_read === false;
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.is_read) ||
      (filter === "orders" && notification.related_type === "new_order") ||
      (filter === "returns" &&
        notification.related_type === "return_request") ||
      (filter === "refunds" && notification.related_type === "refund_request");

    const matchesSearch =
      !searchQuery ||
      notification.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_order":
        return <IconShoppingCart size={16} color="blue" />;
      case "return_request":
        return <IconPackage size={16} color="orange" />;
      case "refund_request":
        return <IconCurrencyRupee size={16} color="green" />;
      case "cancel_request":
        return <IconX size={16} color="red" />;
      default:
        return <IconBell size={16} />;
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

    // Set up real-time subscription
    const subscription = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: "notification_type=eq.admin",
        },
        (payload) => {
          console.log("New admin notification:", payload);
          setNotifications((prev) => [payload.new, ...prev]);
          if (!payload.new.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Container size="lg" py="md">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group>
            <Title order={2}>Admin Notifications</Title>
            {unreadCount > 0 && (
              <Badge color="red" variant="filled" size="lg">
                {unreadCount}
              </Badge>
            )}
          </Group>
          <Group>
            <ActionIcon
              variant="light"
              onClick={fetchNotifications}
              loading={loading}
            >
              <IconRefresh size={16} />
            </ActionIcon>
            {unreadCount > 0 && (
              <Button
                leftSection={<IconCheck size={16} />}
                variant="light"
                size="sm"
                onClick={markAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </Group>
        </Group>

        <Paper p="md" withBorder>
          <Group grow>
            <TextInput
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
            <Select
              placeholder="Filter by type"
              value={filter}
              onChange={setFilter}
              data={[
                { value: "all", label: "All Notifications" },
                { value: "unread", label: "Unread Only" },
                { value: "orders", label: "New Orders" },
                { value: "returns", label: "Return Requests" },
                { value: "refunds", label: "Refund Requests" },
              ]}
              leftSection={<IconFilter size={16} />}
            />
          </Group>
        </Paper>

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        <ScrollArea h={600}>
          <Stack gap="xs">
            {filteredNotifications.length === 0 ? (
              <Paper p="xl" withBorder>
                <Center>
                  <Stack align="center" gap="sm">
                    <IconBellOff size={48} color="gray" />
                    <Text c="dimmed">No notifications found</Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              filteredNotifications.map((notification) => (
                <Paper
                  key={notification.id}
                  p="md"
                  withBorder
                  style={{
                    backgroundColor: notification.is_read
                      ? "transparent"
                      : "#fff5f5",
                    borderLeft: notification.is_read
                      ? "none"
                      : "4px solid #e03131",
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Group align="flex-start" gap="sm" style={{ flex: 1 }}>
                      {getNotificationIcon(notification.related_type)}
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Group justify="space-between">
                          <Text fw={notification.is_read ? 400 : 600} size="sm">
                            {notification.heading}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDate(notification.created_at)}
                          </Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          {notification.description}
                        </Text>
                        <Group gap="xs">
                          <Badge variant="light" size="xs">
                            {notification.related_type?.replace("_", " ")}
                          </Badge>
                          {notification.related_id && (
                            <Badge variant="outline" size="xs">
                              ID: {notification.related_id}
                            </Badge>
                          )}
                        </Group>
                      </Stack>
                    </Group>
                    <Group gap="xs">
                      {!notification.is_read && (
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="blue"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <IconCheck size={12} />
                        </ActionIcon>
                      )}
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="red"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <IconX size={12} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Container>
  );
};

export default AdminNotifications;
