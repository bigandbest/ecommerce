import express from 'express';
import { supabase } from '../config/supabaseClient.js';
import { createNotificationHelper } from '../controller/NotificationHelpers.js';

const router = express.Router();

// Test notification creation
router.post('/test-notification', async (req, res) => {
  try {
    const { user_id, description } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Create test notification
    const notification = await createNotificationHelper(
      user_id,
      'Test Return Notification',
      description || 'Your return request has been approved for testing.',
      'return',
      'test-order-id'
    );

    if (notification) {
      res.json({ 
        success: true, 
        message: 'Test notification created',
        notification 
      });
    } else {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all notifications for debugging
router.get('/all-notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, notifications: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test return order notification flow
router.post('/test-return-notification', async (req, res) => {
  try {
    const { user_id, order_id, status } = req.body;
    
    if (!user_id || !order_id || !status) {
      return res.status(400).json({ error: 'user_id, order_id, and status are required' });
    }

    // Simulate return order status update notification
    const notification = await createNotificationHelper(
      user_id,
      `Return Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your return request has been ${status}. ${status === 'approved' ? 'Refund processing will begin shortly.' : 'Please contact support for more details.'}`,
      'return',
      order_id
    );

    if (notification) {
      res.json({ 
        success: true, 
        message: 'Return notification created',
        notification 
      });
    } else {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  } catch (error) {
    console.error('Test return notification error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;