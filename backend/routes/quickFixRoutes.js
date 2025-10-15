import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

// Quick test notification creation
router.post('/create-notification', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: user_id,
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
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, notification: data[0] });
  } catch (error) {
    console.error('Exception:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get notifications for user
router.get('/notifications/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, notifications: data });
  } catch (error) {
    console.error('Exception:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;