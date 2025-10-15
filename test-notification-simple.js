// Simple test to create notification directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotification() {
  try {
    // Test user ID from your error log
    const userId = 'b1eb759c-129e-4cf8-afed-76f689c5bc37';
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          heading: 'Return Request Approved',
          description: 'Your return request has been approved. Refund processing will begin shortly.',
          related_type: 'return',
          related_id: 'test-order-123',
          notification_type: 'user',
          is_read: false,
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testNotification();