import { supabase } from "../config/supabaseClient.js";

// Add Recommended Store
export async function addRecommendedStore(req, res) {
  try {
    const { name } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("recommended_store").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });

      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("recommended_store").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insert new Recommended Store into the 'recommended_store' table
    const { data, error } = await supabase.from("recommended_store").insert([{ name, image_url: imageUrl }]).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, recommendedStore: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Edit Recommended Store
export async function editRecommendedStore(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const imageFile = req.file;
    let updateData = { name };

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("recommended_store").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });
      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("recommended_store").getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    // Update the record in the 'recommended_store' table
    const { data, error } = await supabase.from("recommended_store").update(updateData).eq("id", id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, recommendedStore: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete Recommended Store
export async function deleteRecommendedStore(req, res) {
  try {
    const { id } = req.params;
    // The foreign key constraint with ON DELETE CASCADE will handle deleting the mapping entries
    const { error } = await supabase.from("recommended_store").delete().eq("id", id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Recommended Store deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All Recommended Stores
export async function getAllRecommendedStores(req, res) {
  try {
    const { data, error } = await supabase.from("recommended_store").select("*");
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, recommendedStores: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View a Single Recommended Store
export async function getSingleRecommendedStore(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("recommended_store")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: "Recommended Store not found" });

    res.json({ success: true, recommendedStore: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}