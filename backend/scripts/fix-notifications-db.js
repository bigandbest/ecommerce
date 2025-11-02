import { supabase } from "../config/supabaseClient.js";

async function fixNotificationsDatabase() {
  console.log("🔧 Fixing notifications database structure...");

  try {
    // Check current table structure
    console.log("📋 Checking current table structure...");
    
    const { data: tableInfo, error: tableError } = await supabase
      .from("notifications")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Error checking table:", tableError);
      return;
    }

    console.log("✅ Table exists and is accessible");

    // Try to add missing columns using raw SQL
    console.log("🔄 Ensuring all required columns exist...");

    // Check if is_read column works
    const { data: testRead, error: readError } = await supabase
      .from("notifications")
      .select("is_read")
      .limit(1);

    if (readError && readError.code === '42703') {
      console.log("⚠️  is_read column missing, needs to be added manually");
      console.log("Please run this SQL in your Supabase SQL editor:");
      console.log(`
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS related_id UUID,
ADD COLUMN IF NOT EXISTS related_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS notification_type VARCHAR(20) DEFAULT 'user';

-- Update existing notifications
UPDATE notifications SET is_read = FALSE WHERE is_read IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      `);
    } else {
      console.log("✅ is_read column exists and works");
    }

    // Test basic operations
    console.log("🧪 Testing basic operations...");

    // Try to create a test notification
    const testNotification = {
      heading: "Database Test",
      description: "Testing database structure",
      expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_read: false,
      created_at: new Date().toISOString()
    };

    const { data: created, error: createError } = await supabase
      .from("notifications")
      .insert([testNotification])
      .select()
      .single();

    if (createError) {
      console.error("❌ Error creating test notification:", createError);
    } else {
      console.log("✅ Test notification created successfully");

      // Test update
      const { data: updated, error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", created.id)
        .select();

      if (updateError) {
        console.error("❌ Error updating notification:", updateError);
      } else {
        console.log("✅ Test notification updated successfully");
      }

      // Clean up test notification
      await supabase
        .from("notifications")
        .delete()
        .eq("id", created.id);

      console.log("🧹 Test notification cleaned up");
    }

    console.log("✅ Database structure check completed!");

  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the fix
fixNotificationsDatabase();