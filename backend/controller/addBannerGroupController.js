import { supabase } from "../config/supabaseClient.js";

// Helper function to upload an image to Supabase Storage
async function uploadImage(file, bucketName) {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  return urlData.publicUrl;
}

// Add a new Banner Group and optionally map a Banner to it
export async function addBannerGroup(req, res) {
  try {
    const { name, banner_id } = req.body;
    let imageUrl = null;

    // Fix: Use req.file instead of req.files for single file upload
    const imageFile = req.file;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile, "addBannerGroup");
    }

    if (banner_id) {
      const { data: bannerData, error: bannerError } = await supabase
          .from("add_banner")
          .select("id")
          .eq("id", banner_id)
          .single();

      if (bannerError || !bannerData) {
          return res.status(404).json({ success: false, error: "Banner not found." });
      }
    }

    const { data, error } = await supabase.from("add_banner_group").insert([{ name, image_url: imageUrl, banner_id: banner_id }]).select().single();
    if (error) throw error;
    
    res.status(201).json({ success: true, bannerGroup: data });
  } catch (err) {
    console.error('Error in addBannerGroup:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Map a Banner to a Banner Group
export async function mapBannerToGroup(req, res) {
    try {
        const { groupId, bannerId } = req.body;
        
        const { data: groupData, error: groupError } = await supabase.from("add_banner_group").select("id").eq("id", groupId).single();
        if (groupError || !groupData) return res.status(404).json({ success: false, error: "Banner Group not found." });

        const { data: bannerData, error: bannerError } = await supabase.from("add_banner").select("id").eq("id", bannerId).single();
        if (bannerError || !bannerData) return res.status(404).json({ success: false, error: "Banner not found." });

        const { data, error } = await supabase
            .from("add_banner_group")
            .update({ banner_id: bannerId })
            .eq("id", groupId)
            .select()
            .single();

        if (error) throw error;
        
        res.status(200).json({ success: true, message: "Banner mapped to group successfully.", bannerGroup: data });
    } catch (err) {
        console.error('Error in mapBannerToGroup:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

// Update a Banner Group
export async function updateBannerGroup(req, res) {
  try {
    const { id } = req.params;
    const { name, banner_id } = req.body;
    let updateData = { name };

    // Fix: Use req.file instead of req.files for single file upload
    const imageFile = req.file;

    if (imageFile) {
      const imageUrl = await uploadImage(imageFile, "addBannerGroup");
      updateData.image_url = imageUrl;
    }
    
    if (banner_id) {
        updateData.banner_id = banner_id;
    }

    const { data, error } = await supabase.from("add_banner_group").update(updateData).eq("id", id).select().single();
    if (error) throw error;

    res.status(200).json({ success: true, bannerGroup: data });
  } catch (err) {
    console.error('Error in updateBannerGroup:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete a Banner Group
export async function deleteBannerGroup(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("add_banner_group").delete().eq("id", id);
    if (error) throw error;
    
    res.status(204).json({ success: true, message: "Banner Group deleted successfully." });
  } catch (err) {
    console.error('Error in deleteBannerGroup:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all Banner Groups
export async function getAllBannerGroups(req, res) {
  try {
    const { data, error } = await supabase.from("add_banner_group").select("*");
    if (error) throw error;
    
    res.status(200).json({ success: true, bannerGroups: data });
  } catch (err) {
    console.error('Error in getAllBannerGroups:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get one Banner Group by ID
export async function getBannerGroupById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("add_banner_group").select("*").eq("id", id).single();
    if (error) throw error;
    
    if (!data) return res.status(404).json({ success: false, error: "Banner Group not found." });

    res.status(200).json({ success: true, bannerGroup: data });
  } catch (err) {
    console.error('Error in getBannerGroupById:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all Banner Groups for a specific Banner
export async function getGroupsByBannerId(req, res) {
  try {
    const { bannerId } = req.params;
    const { data, error } = await supabase
      .from("add_banner_group")
      .select("*")
      .eq("banner_id", bannerId);

    if (error) throw error;
    
    res.status(200).json({ success: true, bannerGroups: data });
  } catch (err) {
    console.error('Error in getGroupsByBannerId:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}