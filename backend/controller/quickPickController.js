import { supabase } from "../config/supabaseClient.js";

// Add a Quick Pick
export async function addQuickPick(req, res) {
  try {
    const { name } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("quickPick").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });

      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("quickPick").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insert new Quick Pick into the 'quick_pick' table
    const { data, error } = await supabase.from("quick_pick").insert([{ name, image_url: imageUrl }]).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, quickPick: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update a Quick Pick
export async function updateQuickPick(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const imageFile = req.file;
    let updateData = { name };

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("quickPick").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });
      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("quickPick").getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    // Update the record in the 'quick_pick' table
    const { data, error } = await supabase.from("quick_pick").update(updateData).eq("id", id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, quickPick: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete a Quick Pick
export async function deleteQuickPick(req, res) {
  try {
    const { id } = req.params;
    // The foreign key constraint with ON DELETE CASCADE will handle deleting the mapping entries in product_group
    const { error } = await supabase.from("quick_pick").delete().eq("id", id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Quick Pick deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All Quick Picks
export async function getAllQuickPicks(req, res) {
  try {
    const { data, error } = await supabase.from("quick_pick").select("*");
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, quickPicks: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View a Single Quick Pick
export async function getQuickPickById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("quick_pick")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: "Quick Pick not found" });

    res.json({ success: true, quickPick: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}