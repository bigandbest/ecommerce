import { supabase } from "../config/supabaseClient.js";

// Add a Video Card
export async function addVideoCard(req, res) {
  try {
    console.log("addVideoCard - req.body:", req.body);
    console.log("addVideoCard - req.files:", req.files);

    // With multer.any(), text fields should be in req.body
    const { title, description, video_url, thumbnail_url, active, position } =
      req.body;

    // Convert string boolean values to actual booleans
    const processedActive =
      active === "true" || active === true || active === undefined
        ? true
        : false;

    // For now, disable file upload since we're testing text fields
    const thumbnailFile = null;
    let processedThumbnailUrl = thumbnail_url;

    // Upload thumbnail to Supabase Storage if a file is provided
    if (thumbnailFile) {
      const fileExt = thumbnailFile.originalname.split(".").pop();
      const fileName = `video_thumb_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("video_thumbnails")
        .upload(fileName, thumbnailFile.buffer, {
          contentType: thumbnailFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res
          .status(400)
          .json({ success: false, error: uploadError.message });

      const { data: urlData } = supabase.storage
        .from("video_thumbnails")
        .getPublicUrl(fileName);
      processedThumbnailUrl = urlData.publicUrl;
    }

    // Insert video card into database
    const { data, error } = await supabase
      .from("video_cards")
      .insert([
        {
          title,
          description,
          video_url,
          thumbnail_url: processedThumbnailUrl,
          active: processedActive,
          position: position || 0,
        },
      ])
      .select();

    if (error)
      return res.status(400).json({ success: false, error: error.message });

    res.status(201).json({
      success: true,
      message: "Video card added successfully",
      videoCard: data[0],
    });
  } catch (error) {
    console.error("Error adding video card:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update a Video Card
export async function updateVideoCard(req, res) {
  try {
    console.log("updateVideoCard - req.body:", req.body);
    console.log("updateVideoCard - req.params:", req.params);
    console.log("updateVideoCard - req.files:", req.files);

    const { id } = req.params;
    // With multer.any(), text fields should be in req.body
    const { title, description, video_url, thumbnail_url, active, position } =
      req.body;

    if (!title && !description && !video_url) {
      return res.status(400).json({
        success: false,
        error:
          "Request body is empty or malformed. Please check that form data is being sent correctly.",
      });
    }

    const processedActive = active === "true" || active === true ? true : false;

    // For now, disable file upload since we're testing text fields
    const thumbnailFile = null;
    let processedThumbnailUrl = thumbnail_url;

    // Upload new thumbnail if provided
    if (thumbnailFile) {
      const fileExt = thumbnailFile.originalname.split(".").pop();
      const fileName = `video_thumb_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("video_thumbnails")
        .upload(fileName, thumbnailFile.buffer, {
          contentType: thumbnailFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res
          .status(400)
          .json({ success: false, error: uploadError.message });

      const { data: urlData } = supabase.storage
        .from("video_thumbnails")
        .getPublicUrl(fileName);
      processedThumbnailUrl = urlData.publicUrl;
    }

    // Update video card in database
    const { data, error } = await supabase
      .from("video_cards")
      .update({
        title,
        description,
        video_url,
        thumbnail_url: processedThumbnailUrl,
        active: processedActive,
        position,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select();

    if (error)
      return res.status(400).json({ success: false, error: error.message });

    res.status(200).json({
      success: true,
      message: "Video card updated successfully",
      videoCard: data[0],
    });
  } catch (error) {
    console.error("Error updating video card:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete a Video Card
export async function deleteVideoCard(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("video_cards").delete().eq("id", id);

    if (error)
      return res.status(400).json({ success: false, error: error.message });

    res.status(200).json({
      success: true,
      message: "Video card deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video card:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get all Video Cards
export async function getAllVideoCards(req, res) {
  try {
    const { data, error } = await supabase
      .from("video_cards")
      .select("*")
      .order("position", { ascending: true });

    if (error)
      return res.status(400).json({ success: false, error: error.message });

    res.status(200).json({
      success: true,
      videoCards: data,
    });
  } catch (error) {
    console.error("Error fetching video cards:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get active Video Cards
export async function getActiveVideoCards(req, res) {
  try {
    const { data, error } = await supabase
      .from("video_cards")
      .select("*")
      .eq("active", true)
      .order("position", { ascending: true });

    if (error)
      return res.status(400).json({ success: false, error: error.message });

    res.status(200).json({
      success: true,
      videoCards: data,
    });
  } catch (error) {
    console.error("Error fetching active video cards:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get a single Video Card by ID
export async function getVideoCardById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("video_cards")
      .select("*")
      .eq("id", id)
      .single();

    if (error)
      return res.status(400).json({ success: false, error: error.message });

    res.status(200).json({
      success: true,
      videoCard: data,
    });
  } catch (error) {
    console.error("Error fetching video card:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
