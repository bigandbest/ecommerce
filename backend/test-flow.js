import { supabase } from "./config/supabaseClient.js";
import { createNotificationHelper } from "./controller/NotificationHelpers.js";

async function testCompleteFlow() {
  console.log("=== Testing Complete Notification Flow ===");
  
  try {
    // 1. Get a real user from database
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, name, email")
      .limit(1);
    
    if (userError || !users?.length) {
      console.error("No users found:", userError);
      return;
    }
    
    const testUser = users[0];
    console.log("Test user:", testUser);
    
    // 2. Create notification using helper
    console.log("\n=== Creating notification ===");
    const notification = await createNotificationHelper(
      testUser.id,
      "Return Request Approved",
      "Your return request has been approved. Refund processing will begin shortly.",
      "return",
      "test-order-123"
    );
    
    if (notification) {
      console.log("✅ Notification created:", notification);
    } else {
      console.log("❌ Failed to create notification");
      return;
    }
    
    // 3. Test fetching user notifications
    console.log("\n=== Fetching user notifications ===");
    const { data: userNotifications, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", testUser.id)
      .order("created_at", { ascending: false });
    
    if (fetchError) {
      console.error("Error fetching notifications:", fetchError);
    } else {
      console.log("✅ User notifications:", userNotifications);
    }
    
    // 4. Test the API endpoint
    console.log("\n=== Testing API endpoint ===");
    const response = await fetch(`http://localhost:8000/api/notifications/user/${testUser.id}`);
    const apiResult = await response.json();
    console.log("API Response:", apiResult);
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testCompleteFlow();