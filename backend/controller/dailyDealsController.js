import { supabase } from "../config/supabaseClient.js";

// Add a Daily Deal
export async function addDailyDeal(req, res) {
  try {
    const { title, discount, badge, sort_order } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("daily-deals")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res
          .status(400)
          .json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage
        .from("daily-deals")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insert new daily deal into the 'daily_deals' table
    const { data, error } = await supabase
      .from("daily_deals")
      .insert([{ title, image_url: imageUrl, discount, badge, sort_order }])
      .select()
      .single();
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, deal: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update a Daily Deal
export async function updateDailyDeal(req, res) {
  try {
    const { id } = req.params;
    const { title, discount, badge, sort_order, active } = req.body;
    const imageFile = req.file;
    let updateData = { title, discount, badge, sort_order, active };

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("daily-deals")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });
      if (uploadError)
        return res
          .status(400)
          .json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage
        .from("daily-deals")
        .getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    // Update the record in the 'daily_deals' table
    const { data, error } = await supabase
      .from("daily_deals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, deal: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete a Daily Deal
export async function deleteDailyDeal(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("daily_deals").delete().eq("id", id);
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Daily deal deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All Daily Deals
export async function getAllDailyDeals(req, res) {
  try {
    const { data, error } = await supabase
      .from("daily_deals")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, deals: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View a Single Daily Deal
export async function getDailyDealById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("daily_deals")
      .select("*")
      .eq("id", id)
      .single();

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    if (!data)
      return res
        .status(404)
        .json({ success: false, error: "Daily deal not found" });

    res.json({ success: true, deal: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
