import { supabase } from "../config/supabaseClient.js";

// Helper function to upload an image to Supabase Storage
async function uploadImage(file, bnbGroup) {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage.from(bnbGroup).upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage.from(bnbGroup).getPublicUrl(fileName);
  return urlData.publicUrl;
}

// Add a new B&B Group and optionally map a B&B to it
export async function addBandBGroup(req, res) {
  try {
    const { name, bnb_id } = req.body;
    let imageUrl = null;

    const imageFile = req.files ? req.files.find(file => file.fieldname === 'image_url') : null;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile, "bnbGroup");
    }

    if (bnb_id) {
      const { data: bnbData, error: bnbError } = await supabase
          .from("bnb")
          .select("id")
          .eq("id", bnb_id)
          .single();

      if (bnbError || !bnbData) {
          return res.status(404).json({ success: false, error: "B&B not found." });
      }
    }

    const { data, error } = await supabase.from("bnb_group").insert([{ name, image_url: imageUrl, bnb_id: bnb_id }]).select().single();
    if (error) throw error;
    
    res.status(201).json({ success: true, bandbGroup: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Map a B&B to a B&B Group
export async function mapBandBToGroup(req, res) {
    try {
        const { groupId, bnbId } = req.body;
        
        const { data: groupData, error: groupError } = await supabase.from("bnb_group").select("id").eq("id", groupId).single();
        if (groupError || !groupData) return res.status(404).json({ success: false, error: "B&B Group not found." });

        const { data: bnbData, error: bnbError } = await supabase.from("bnb").select("id").eq("id", bnbId).single();
        if (bnbError || !bnbData) return res.status(404).json({ success: false, error: "B&B not found." });

        const { data, error } = await supabase
            .from("bnb_group")
            .update({ bnb_id: bnbId })
            .eq("id", groupId)
            .select()
            .single();

        if (error) throw error;
        
        res.status(200).json({ success: true, message: "B&B mapped to group successfully.", bandbGroup: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

// Update a B&B Group
export async function updateBandBGroup(req, res) {
  try {
    const { id } = req.params;
    const { name, bnb_id } = req.body;
    let updateData = { name };

    const imageFile = req.files ? req.files.find(file => file.fieldname === 'image_url') : null;

    if (imageFile) {
      const imageUrl = await uploadImage(imageFile, "bnbGroup");
      updateData.image_url = imageUrl;
    }
    
    if (bnb_id) {
        updateData.bnb_id = bnb_id;
    }

    const { data, error } = await supabase.from("bnb_group").update(updateData).eq("id", id).select().single();
    if (error) throw error;

    res.status(200).json({ success: true, bandbGroup: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete a B&B Group
export async function deleteBandBGroup(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("bnb_group").delete().eq("id", id);
    if (error) throw error;
    
    res.status(204).json({ success: true, message: "B&B Group deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all B&B Groups
export async function getAllBandBGroups(req, res) {
  try {
    const { data, error } = await supabase.from("bnb_group").select("*");
    if (error) throw error;
    
    res.status(200).json({ success: true, bandbGroups: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get one B&B Group by ID
export async function getBandBGroupById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("bnb_group").select("*").eq("id", id).single();
    if (error) throw error;
    
    if (!data) return res.status(404).json({ success: false, error: "B&B Group not found." });

    res.status(200).json({ success: true, bandbGroup: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// 👇 NEW FUNCTION TO ADD
// Get all B&B Groups for a specific B&B
export async function getGroupsByBandBId(req, res) {
  try {
    const { bnbId } = req.params;
    const { data, error } = await supabase
      .from("bnb_group")
      .select("*")
      .eq("bnb_id", bnbId);

    if (error) throw error;
    
    res.status(200).json({ success: true, bandbGroups: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}