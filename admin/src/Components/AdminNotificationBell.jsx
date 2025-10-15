import { useState, useEffect } from "react";
import { ActionIcon, Group, Indicator } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { supabase } from "../../../config/supabaseClient";

const AdminNotificationBell = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .or("notification_type.eq.admin,user_id.is.null")
        .eq("is_read", false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching admin notification count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Set up real-time subscription for new admin notifications
    const subscription = supabase
      .channel("admin-notification-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: "notification_type=eq.admin",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Group>
      <Indicator
        disabled={unreadCount === 0}
        label={unreadCount > 99 ? "99+" : unreadCount}
        color="red"
        size={16}
      >
        <ActionIcon variant="light" size="lg" onClick={onClick}>
          <IconBell size={20} />
        </ActionIcon>
      </Indicator>
    </Group>
  );
};

export default AdminNotificationBell;
