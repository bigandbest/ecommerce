import { supabase } from "../config/supabaseClient.js";

// Add a Saving Zone
export async function addSavingZone(req, res) {
  try {
    const { name } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("savingZone").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });

      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("savingZone").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insert new Saving Zone into the 'saving_zone' table
    const { data, error } = await supabase.from("saving_zone").insert([{ name, image_url: imageUrl }]).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, savingZone: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update a Saving Zone
export async function updateSavingZone(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const imageFile = req.file;
    let updateData = { name };

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("savingZone").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });
      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("savingZone").getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    // Update the record in the 'saving_zone' table
    const { data, error } = await supabase.from("saving_zone").update(updateData).eq("id", id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, savingZone: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete a Saving Zone
export async function deleteSavingZone(req, res) {
  try {
    const { id } = req.params;
    // The foreign key constraint with ON DELETE CASCADE will handle deleting the mapping entries in saving_zone_group
    const { error } = await supabase.from("saving_zone").delete().eq("id", id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Saving Zone deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All Saving Zones
export async function getAllSavingZones(req, res) {
  try {
    const { data, error } = await supabase.from("saving_zone").select("*");
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, savingZones: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View a Single Saving Zone
export async function getSavingZoneById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("saving_zone")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: "Saving Zone not found" });

    res.json({ success: true, savingZone: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}