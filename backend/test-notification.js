import { supabase } from "./config/supabaseClient.js";

// Test notification creation
async function testNotificationCreation() {
  console.log("Testing notification creation...");
  
  try {
    // Create a test notification
    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: "test-user-id", // Replace with actual user ID
          heading: "Test Return Notification",
          description: "Your return request has been approved for testing.",
          related_type: "return",
          related_id: "test-order-id",
          notification_type: "user",
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
    } else {
      console.log("Notification created successfully:", data);
    }

    // Test fetching notifications
    const { data: notifications, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .limit(5);

    if (fetchError) {
      console.error("Error fetching notifications:", fetchError);
    } else {
      console.log("Recent notifications:", notifications);
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testNotificationCreation();