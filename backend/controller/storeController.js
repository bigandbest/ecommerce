import { supabase } from "../config/supabaseClient.js";

// Add Store
export async function addStore(req, res) {
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
        .from("Store") // bucket name
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res.status(400).json({ success: false, error: uploadError.message });

      const { data: urlData } = supabase.storage.from("Store").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("Store") // table name
      .insert([{ name, link, image: imageUrl }]) // using "image" column consistently
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, store: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update Store
export async function updateStore(req, res) {
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
        .from("Store")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res.status(400).json({ success: false, error: uploadError.message });

      const { data: urlData } = supabase.storage.from("Store").getPublicUrl(fileName);
      updateData.image = urlData.publicUrl; // consistent column name
    }

    const { data, error } = await supabase
      .from("Store")
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

// Delete Store
export async function deleteStore(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("Store").delete().eq("id", id);

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Store deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All Stores
export async function getAllStores(req, res) {
  try {
    const { data, error } = await supabase.from("Store").select("*");

    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, stores: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
