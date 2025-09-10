import { supabase } from "../config/supabaseClient.js";

// ✅ Helper: Upload image to Supabase bucket
async function uploadNotificationImage(imageFile) {
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

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
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // If admin uploads file via frontend → req.file / req.files (if using multipart)
    if (req.file) {
      image_url = await uploadNotificationImage(req.file);
    }

    const expiryISO = new Date(`${expiry_date}T23:59:59Z`).toISOString();

    const { data, error } = await supabase
      .from("notifications")
      .insert([{ heading, description, expiry_date: expiryISO, image_url, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, notification: data });
  } catch (err) {
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
    res.status(200).json({ success: true, notifications: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    if (expiry_date) updates.expiry_date = new Date(`${expiry_date}T23:59:59Z`).toISOString();
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

    const { error } = await supabase.from("notifications").delete().eq("id", id);

    if (error) throw error;
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
