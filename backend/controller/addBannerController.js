import { supabase } from "../config/supabaseClient.js";

// Add a Banner
export async function addBanner(req, res) {
  try {
    // 💡 MODIFIED: Destructuring banner_type from req.body
    const { name, banner_type } = req.body; 
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("addBanner").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });

      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("addBanner").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // 💡 MODIFIED: Including banner_type in the insert object
    const { data, error } = await supabase.from("add_banner").insert([{ name, image_url: imageUrl, banner_type }]).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, banner: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update a Banner
export async function updateBanner(req, res) {
  try {
    const { id } = req.params;
    // 💡 MODIFIED: Destructuring banner_type from req.body
    const { name, banner_type } = req.body;
    const imageFile = req.file;
    // 💡 MODIFIED: Including banner_type in the initial updateData object
    let updateData = { name, banner_type }; 

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("addBanner").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });
      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("addBanner").getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    // Update the record in the 'add_banner' table
    const { data, error } = await supabase.from("add_banner").update(updateData).eq("id", id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, banner: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete a Banner
export async function deleteBanner(req, res) {
  try {
    const { id } = req.params;
    // The foreign key constraint with ON DELETE CASCADE will handle deleting the mapping entries in product_group
    const { error } = await supabase.from("add_banner").delete().eq("id", id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All Banners
// No change needed, as SELECT * will automatically include the new column
export async function getAllBanners(req, res) {
  try {
    const { data, error } = await supabase.from("add_banner").select("*");
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, banners: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View a Single Banner
// No change needed, as SELECT * will automatically include the new column
export async function getBannerById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("add_banner")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: "Banner not found" });

    res.json({ success: true, banner: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// 🆕 NEW API: Get all Banners by banner_type
export async function getBannersByType(req, res) {
  try {
    const { bannerType } = req.params;
    
    if (!bannerType) {
      return res.status(400).json({ success: false, error: "Banner type is required." });
    }

    const { data, error } = await supabase
      .from("add_banner")
      .select("*")
      .eq("banner_type", bannerType); // 💡 Filtering by the new column

    if (error) return res.status(400).json({ success: false, error: error.message });
    
    // You might want to return 404 if no banners are found, but returning an empty array (200 OK) is also common for list endpoints.
    res.status(200).json({ success: true, banners: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}