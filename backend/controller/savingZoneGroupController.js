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

// Add a new Saving Zone Group and optionally map a Saving Zone to it
export async function addSavingZoneGroup(req, res) {
  try {
    const { name, saving_zone_id } = req.body;
    let imageUrl = null;

    const imageFile = req.files ? req.files.find(file => file.fieldname === 'image_url') : null;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile, "savingZoneGroup");
    }

    if (saving_zone_id) {
      const { data: savingZoneData, error: savingZoneError } = await supabase
          .from("saving_zone")
          .select("id")
          .eq("id", saving_zone_id)
          .single();

      if (savingZoneError || !savingZoneData) {
          return res.status(404).json({ success: false, error: "Saving Zone not found." });
      }
    }

    const { data, error } = await supabase.from("saving_zone_group").insert([{ name, image_url: imageUrl, saving_zone_id }]).select().single();
    if (error) throw error;
    
    res.status(201).json({ success: true, savingZoneGroup: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Map a Saving Zone to a Saving Zone Group
export async function mapSavingZoneToGroup(req, res) {
    try {
        const { groupId, savingZoneId } = req.body;
        
        const { data: groupData, error: groupError } = await supabase.from("saving_zone_group").select("id").eq("id", groupId).single();
        if (groupError || !groupData) return res.status(404).json({ success: false, error: "Saving Zone Group not found." });

        const { data: savingZoneData, error: savingZoneError } = await supabase.from("saving_zone").select("id").eq("id", savingZoneId).single();
        if (savingZoneError || !savingZoneData) return res.status(404).json({ success: false, error: "Saving Zone not found." });

        const { data, error } = await supabase
            .from("saving_zone_group")
            .update({ saving_zone_id: savingZoneId })
            .eq("id", groupId)
            .select()
            .single();

        if (error) throw error;
        
        res.status(200).json({ success: true, message: "Saving Zone mapped to group successfully.", savingZoneGroup: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// Update a Saving Zone Group
export async function updateSavingZoneGroup(req, res) {
  try {
    const { id } = req.params;
    const { name, saving_zone_id } = req.body;
    let updateData = { name };

    const imageFile = req.files ? req.files.find(file => file.fieldname === 'image_url') : null;

    if (imageFile) {
      const imageUrl = await uploadImage(imageFile, "savingZoneGroup");
      updateData.image_url = imageUrl;
    }
    
    if (saving_zone_id) {
        updateData.saving_zone_id = saving_zone_id;
    }

    const { data, error } = await supabase.from("saving_zone_group").update(updateData).eq("id", id).select().single();
    if (error) throw error;

    res.status(200).json({ success: true, savingZoneGroup: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete a Saving Zone Group
export async function deleteSavingZoneGroup(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("saving_zone_group").delete().eq("id", id);
    if (error) throw error;
    
    res.status(204).json({ success: true, message: "Saving Zone Group deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all Saving Zone Groups
export async function getAllSavingZoneGroups(req, res) {
  try {
    const { data, error } = await supabase.from("saving_zone_group").select("*");
    if (error) throw error;
    
    res.status(200).json({ success: true, savingZoneGroups: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get one Saving Zone Group by ID
export async function getSavingZoneGroupById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("saving_zone_group").select("*").eq("id", id).single();
    if (error) throw error;
    
    if (!data) return res.status(404).json({ success: false, error: "Saving Zone Group not found." });

    res.status(200).json({ success: true, savingZoneGroup: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all Saving Zone Groups for a specific Saving Zone
export async function getGroupsBySavingZoneId(req, res) {
  try {
    const { savingZoneId } = req.params;
    const { data, error } = await supabase
      .from("saving_zone_group")
      .select("*")
      .eq("saving_zone_id", savingZoneId);

    if (error) throw error;
    
    res.status(200).json({ success: true, savingZoneGroups: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}