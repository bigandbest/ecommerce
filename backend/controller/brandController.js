import { supabase } from "../config/supabaseClient.js";

// Add Brand
export async function addBrand(req, res) {
  try {
    const { name } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("brand").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });

      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("brand").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insert new Brand into the 'brand' table
    const { data, error } = await supabase.from("brand").insert([{ name, image_url: imageUrl }]).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, brand: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Edit Brand
export async function editBrand(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const imageFile = req.file;
    let updateData = { name };

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("brand").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });
      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("brand").getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    // Update the record in the 'brand' table
    const { data, error } = await supabase.from("brand").update(updateData).eq("id", id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, brand: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete Brand
export async function deleteBrand(req, res) {
  try {
    const { id } = req.params;
    // The foreign key constraint with ON DELETE CASCADE will handle deleting the mapping entries
    const { error } = await supabase.from("brand").delete().eq("id", id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All Brands
export async function getAllBrands(req, res) {
  try {
    const { data, error } = await supabase.from("brand").select("*");
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, brands: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View a Single Brand
export async function getSingleBrand(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("brand")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: "Brand not found" });

    res.json({ success: true, brand: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}