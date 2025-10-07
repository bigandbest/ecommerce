import { supabase } from "../config/supabaseClient.js";

// Add a B&B
export async function addBandB(req, res) {
  try {
    const { name } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("bnb").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });

      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("bnb").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insert new B&B into the 'bnb' table
    const { data, error } = await supabase.from("bnb").insert([{ name, image_url: imageUrl }]).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, bandb: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update a B&B
export async function updateBandB(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const imageFile = req.file;
    let updateData = { name };

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("bnb").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });
      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("bnb").getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    // Update the record in the 'bnb' table
    const { data, error } = await supabase.from("bnb").update(updateData).eq("id", id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, bandb: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete a B&B
export async function deleteBandB(req, res) {
  try {
    const { id } = req.params;
    // The foreign key constraint with ON DELETE CASCADE will handle deleting the mapping entries in product_group
    const { error } = await supabase.from("bnb").delete().eq("id", id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "B&B deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All B&Bs
export async function getAllBandBs(req, res) {
  try {
    const { data, error } = await supabase.from("bnb").select("*");
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, bandbs: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View a Single B&B
export async function getBandBById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("bnb")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: "B&B not found" });

    res.json({ success: true, bandb: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}