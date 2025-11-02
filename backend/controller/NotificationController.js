import { supabase } from "../config/supabaseClient.js";

// ✅ Helper: Upload image to Supabase bucket
async function uploadNotificationImage(imageFile) {
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("notifications")
    .upload(fileName, imageFile);

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage
    .from("notifications")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// ✅ Create Notification (Admin Only)
export async function createNotification(req, res) {
  try {
    const { heading, description, expiry_date } = req.body;
    let image_url = req.body.image_url; // fallback if direct URL given

    if (!heading || !description || !expiry_date) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // If admin uploads file via frontend → req.file / req.files (if using multipart)
    if (req.file) {
      image_url = await uploadNotificationImage(req.file);
    }

    const expiryISO = new Date(`${expiry_date}T23:59:59Z`).toISOString();

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          heading,
          description,
          expiry_date: expiryISO,
          image_url,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, notification: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ Get User Notifications
export async function getUserNotifications(req, res) {
  try {
    const { user_id } = req.params;
    const { limit = 20, unread_only = false } = req.query;

    console.log("Getting notifications for user:", user_id);

    // Try primary query with user_id
    let { data: userNotifications, error: userError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .gte("expiry_date", new Date().toISOString())
      .order("created_at", { ascending: false });

    // If user_id column doesn't exist, try fallback approach
    if (userError && userError.code === '42703') {
      console.log("Fallback: Getting all notifications and filtering");
      console.log("Fallback error:", userError);
      
      const { data: allNotifications, error: fallbackError } = await supabase
        .from("notifications")
        .select("*")
        .gte("expiry_date", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (fallbackError) {
        console.error("Fallback error:", fallbackError);
        return res.status(500).json({ success: false, message: fallbackError.message });
      }

      // Filter by user pattern in description
      userNotifications = (allNotifications || []).filter(notification => {
        const userPattern = new RegExp(`\\[USER:${user_id}\\]`);
        return userPattern.test(notification.description) || !notification.user_id;
      });
    } else if (userError) {
      console.error("Database error:", userError);
      return res.status(500).json({ success: false, message: userError.message });
    }

    // Clean up descriptions and apply filters
    let cleanedNotifications = (userNotifications || []).map((notification) => ({
      ...notification,
      description: notification.description?.replace(/\[USER:[^\]]+\]\s*/, "") || notification.description,
      is_read: notification.is_read || false // Ensure is_read has a default value
    }));

    // Apply unread filter if requested
    if (unread_only === "true") {
      cleanedNotifications = cleanedNotifications.filter(n => !n.is_read);
    }

    // Limit results
    cleanedNotifications = cleanedNotifications.slice(0, parseInt(limit));

    console.log("Found user notifications:", cleanedNotifications.length);

    res.json({
      success: true,
      notifications: cleanedNotifications,
      unread_count: cleanedNotifications.filter((n) => !n.is_read).length,
    });
  } catch (err) {
    console.error("getUserNotifications error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ Mark Notification as Read (backward compatible)
export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;

    // First check if notification exists
    const { data: existingNotification, error: checkError } = await supabase
      .from("notifications")
      .select("id, is_read")
      .eq("id", id)
      .single();

    if (checkError) {
      console.error("Error checking notification:", checkError);
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Update the notification
    const { data, error } = await supabase
      .from("notifications")
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database update error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "Notification not found or already updated" });
    }

    res.json({ success: true, notification: data[0] });
  } catch (err) {
    console.error("markNotificationRead error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ Mark All Notifications as Read (backward compatible)
export async function markAllNotificationsRead(req, res) {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Try to update user-specific notifications first
    let { data, error } = await supabase
      .from("notifications")
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq("user_id", user_id)
      .eq("is_read", false)
      .select();

    // If user_id column doesn't exist, use fallback approach
    if (error && error.code === '42703') {
      console.log("Fallback: Getting all notifications and updating by pattern");
      
      // Get all unread notifications
      const { data: allNotifications, error: fetchError } = await supabase
        .from("notifications")
        .select("id, description")
        .eq("is_read", false);

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError);
        return res.status(500).json({ success: false, message: fetchError.message });
      }

      // Filter notifications for this user
      const userNotificationIds = (allNotifications || []).filter(notification => {
        const userPattern = new RegExp(`\\[USER:${user_id}\\]`);
        return userPattern.test(notification.description);
      }).map(n => n.id);

      if (userNotificationIds.length > 0) {
        // Update notifications by IDs
        const { data: updateData, error: updateError } = await supabase
          .from("notifications")
          .update({ 
            is_read: true,
            read_at: new Date().toISOString()
          })
          .in("id", userNotificationIds)
          .select();

        if (updateError) {
          console.error("Error updating notifications:", updateError);
          return res.status(500).json({ success: false, message: updateError.message });
        }

        data = updateData;
      } else {
        data = [];
      }
    } else if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }

    const updatedCount = data ? data.length : 0;
    res.json({ 
      success: true, 
      message: `${updatedCount} notifications marked as read`,
      updated_count: updatedCount
    });
  } catch (err) {
    console.error("markAllNotificationsRead error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ Get All Active Notifications
export async function getNotifications(req, res) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .gte("expiry_date", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, notifications: data || [] });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ Create Order Notification
export async function createOrderNotification(userId, orderId, status) {
  try {
    const statusMessages = {
      pending: "Your order has been placed successfully!",
      processing: "Your order is being processed.",
      shipped: "Your order has been shipped!",
      delivered: "Your order has been delivered successfully!",
      cancelled: "Your order has been cancelled.",
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: userId,
          heading: `Order Update - ${
            status.charAt(0).toUpperCase() + status.slice(1)
          }`,
          description:
            statusMessages[status] || "Your order status has been updated.",
          related_id: orderId,
          related_type: "order",
          expiry_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { success: !error, data, error };
  } catch (err) {
    console.error("Error creating order notification:", err);
    return { success: false, error: err.message };
  }
}

// ✅ Update Notification (Admin Only)
export async function updateNotification(req, res) {
  try {
    const { id } = req.params;
    const { heading, description, expiry_date } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      image_url = await uploadNotificationImage(req.file);
    }

    const updates = {};
    if (heading) updates.heading = heading;
    if (description) updates.description = description;
    if (expiry_date)
      updates.expiry_date = new Date(`${expiry_date}T23:59:59Z`).toISOString();
    if (image_url) updates.image_url = image_url;

    const { data, error } = await supabase
      .from("notifications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, notification: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ Delete Notification (Admin Only)
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// ✅ Create Product Update Notification
export async function createProductUpdateNotification(
  productId,
  updateType,
  oldValue,
  newValue
) {
  try {
    // Find users who have this product in cart or wishlist
    const { data: cartUsers, error: cartError } = await supabase
      .from("cart_items")
      .select("user_id")
      .eq("product_id", productId);

    const { data: wishlistUsers, error: wishlistError } = await supabase
      .from("wishlist_items")
      .select("user_id")
      .eq("product_id", productId);

    if (cartError || wishlistError) {
      console.error("Error fetching users:", cartError || wishlistError);
      return {
        success: false,
        error: cartError?.message || wishlistError?.message,
      };
    }

    // Get unique user IDs
    const userIds = [
      ...new Set([
        ...(cartUsers?.map((item) => item.user_id) || []),
        ...(wishlistUsers?.map((item) => item.user_id) || []),
      ]),
    ];

    if (userIds.length === 0) {
      return { success: true, message: "No users to notify" };
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single();

    if (productError) {
      console.error("Error fetching product:", productError);
      return { success: false, error: productError.message };
    }

    // Create notification messages based on update type
    let heading = "";
    let description = "";

    switch (updateType) {
      case "price":
        heading = `Price Update: ${product.name}`;
        description = `The price of ${product.name} has changed from ₹${oldValue} to ₹${newValue}.`;
        break;
      case "stock":
        heading = `Stock Update: ${product.name}`;
        description =
          oldValue > newValue
            ? `Stock reduced for ${product.name}. Only ${newValue} items left.`
            : `Stock increased for ${product.name}. Now ${newValue} items available.`;
        break;
      case "availability":
        heading = `Availability Update: ${product.name}`;
        description = newValue
          ? `${product.name} is now back in stock!`
          : `${product.name} is currently out of stock.`;
        break;
      default:
        heading = `Product Update: ${product.name}`;
        description = `${product.name} has been updated. Check the latest details.`;
    }

    // Create notifications for each user
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      heading,
      description,
      related_id: productId,
      related_type: "product",
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) {
      console.error("Error creating notifications:", error);
      return { success: false, error: error.message };
    }

    return { success: true, notifiedUsers: userIds.length };
  } catch (err) {
    console.error("Error creating product update notification:", err);
    return { success: false, error: err.message };
  }
}

// ✅ Get admin notifications
export async function getAdminNotifications(req, res) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or("notification_type.eq.admin,user_id.is.null")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, notifications: data });
  } catch (error) {
    console.error("Error fetching admin notifications:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ✅ Get unread notification count for user
export async function getUnreadCount(req, res) {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Try to get count with user_id first
    let { data: userNotifications, error } = await supabase
      .from("notifications")
      .select("id, is_read, description")
      .eq("user_id", user_id)
      .eq("is_read", false)
      .gte("expiry_date", new Date().toISOString());

    // If user_id column doesn't exist, try fallback approach
    if (error && error.code === '42703') {
      console.log("Fallback: Getting all notifications and filtering");
      console.log("Fallback error:", error);
      
      const { data: allNotifications, error: fallbackError } = await supabase
        .from("notifications")
        .select("id, is_read, description")
        .gte("expiry_date", new Date().toISOString());

      if (fallbackError) {
        console.error("Fallback error:", fallbackError);
        return res.json({ success: true, unread_count: 0 });
      }

      // Filter by user pattern in description and unread status
      userNotifications = (allNotifications || []).filter(notification => {
        const userPattern = new RegExp(`\\[USER:${user_id}\\]`);
        const isForUser = userPattern.test(notification.description) || !notification.user_id;
        const isUnread = !notification.is_read;
        return isForUser && isUnread;
      });
    } else if (error) {
      console.error("Database error:", error);
      return res.json({ success: true, unread_count: 0 });
    }

    const count = userNotifications ? userNotifications.length : 0;
    return res.json({ success: true, unread_count: count });
  } catch (error) {
    console.error("Error fetching unread count:", error.message);
    return res.json({ success: true, unread_count: 0 }); // Return 0 instead of error
  }
}
