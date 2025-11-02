import { supabase } from "../config/supabaseClient.js";

// Get order tracking by order ID
export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order with tracking data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name, image)),
        order_tracking(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Sort tracking by timestamp
    const tracking = order.order_tracking?.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    ) || [];

    res.json({
      success: true,
      order,
      tracking
    });

  } catch (error) {
    console.error("Error fetching order tracking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tracking information"
    });
  }
};

// Add tracking update (Admin only)
export const addTrackingUpdate = async (req, res) => {
  try {
    const { orderId, status, location, description } = req.body;

    // Add tracking entry
    const { data: tracking, error: trackingError } = await supabase
      .from('order_tracking')
      .insert([{
        order_id: orderId,
        status,
        location,
        description,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (trackingError) {
      return res.status(500).json({
        success: false,
        message: "Failed to add tracking update"
      });
    }

    // Update order status and location
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status,
        current_location: location,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (orderError) {
      console.error("Error updating order:", orderError);
    }

    res.json({
      success: true,
      tracking
    });

  } catch (error) {
    console.error("Error adding tracking update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add tracking update"
    });
  }
};

// Search order by tracking number
export const searchByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name, image)),
        order_tracking(*)
      `)
      .eq('tracking_number', trackingNumber)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Order not found with this tracking number"
      });
    }

    const tracking = order.order_tracking?.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    ) || [];

    res.json({
      success: true,
      order,
      tracking
    });

  } catch (error) {
    console.error("Error searching by tracking number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search order"
    });
  }
};