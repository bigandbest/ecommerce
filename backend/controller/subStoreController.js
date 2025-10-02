import { supabase } from "../config/supabaseClient.js";

// Add SubStore
export async function addSubStore(req, res) {
  try {
    const { name, link } = req.body;
    const imageFile = req.file; // multer middleware for file upload

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("SubStore") // 🎯 bucket name
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res.status(400).json({ success: false, error: uploadError.message });

      const { data: urlData } = supabase.storage.from("SubStore").getPublicUrl(fileName); // 🎯 bucket name
      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("SubStore") // 🎯 table name
      .insert([{ name, link, image: imageUrl }]) // using "image" column consistently
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, store: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update SubStore
export async function updateSubStore(req, res) {
  try {
    const { id } = req.params;
    const { name, link } = req.body;
    const imageFile = req.file;

    let updateData = { name, link };

    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("SubStore") // 🎯 bucket name
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res.status(400).json({ success: false, error: uploadError.message });

      const { data: urlData } = supabase.storage.from("SubStore").getPublicUrl(fileName); // 🎯 bucket name
      updateData.image = urlData.publicUrl; // consistent column name
    }

    const { data, error } = await supabase
      .from("SubStore") // 🎯 table name
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, store: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete SubStore
export async function deleteSubStore(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("SubStore").delete().eq("id", id); // 🎯 table name

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Store deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All SubStores
export async function getAllSubStores(req, res) {
  try {
    const { data, error } = await supabase.from("SubStore").select("*"); // 🎯 table name

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, stores: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}