import { supabase } from "../config/supabaseClient.js";

// Add Unique Section
export async function addUniqueSection(req, res) {
  try {
    const { name, section_type } = req.body; // Changed to section_type
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("uniqueSection").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });

      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("uniqueSection").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insert new Unique Section into the 'unique_section' table
    // Changed field to section_type
    const { data, error } = await supabase.from("unique_section").insert([{ name, image_url: imageUrl, section_type }]).select().single();
    if (error) {console.error(error); return res.status(400).json({ success: false, error: error.message });}
    res.status(201).json({ success: true, uniqueSection: data });
  } catch (err) {
    console.error("Add Unique Section Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Edit Unique Section
export async function editUniqueSection(req, res) {
  try {
    const { id } = req.params;
    // Changed to section_type
    const { name, section_type } = req.body; 
    const imageFile = req.file;
    // Changed to section_type
    let updateData = { name, section_type }; 

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("uniqueSection").upload(fileName, imageFile.buffer, { contentType: imageFile.mimetype, upsert: true });
      if (uploadError) return res.status(400).json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage.from("uniqueSection").getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    // Update the record in the 'unique_section' table
    const { data, error } = await supabase.from("unique_section").update(updateData).eq("id", id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, uniqueSection: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete Unique Section
export async function deleteUniqueSection(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("unique_section").delete().eq("id", id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Unique Section deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View All Unique Sections
export async function getAllUniqueSections(req, res) {
  try {
    const { data, error } = await supabase.from("unique_section").select("*");
    if (error) return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, uniqueSections: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// View a Single Unique Section
export async function getSingleUniqueSection(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("unique_section")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: "Unique Section not found" });

    res.json({ success: true, uniqueSection: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// In uniqueSectionController.js
export async function getUniqueSectionsByType(req, res) {
  try {
    const { section_type } = req.params;

    const { data, error } = await supabase
      .from("unique_section")
      .select("*")
      .eq("section_type", section_type);

    if (error) return res.status(400).json({ success: false, error: error.message });

    res.json({ success: true, uniqueSections: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
