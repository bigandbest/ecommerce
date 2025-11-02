import { supabase } from "../config/supabaseClient.js";

// Get all shop by stores
const getAllShopByStores = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("shop_by_stores")
      .select("*")
      .order("id");
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, shopByStores: data });
  } catch (error) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get shop by store by ID
const getShopByStoreById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("shop_by_stores")
      .select("*")
      .eq("id", id)
      .single();
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    if (!data)
      return res
        .status(404)
        .json({ success: false, error: "Shop By Store not found" });
    res.json({ success: true, shopByStore: data });
  } catch (error) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create new shop by store
const createShopByStore = async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    // Upload image to Supabase Storage if a file is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("shop_by_stores")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });

      if (uploadError)
        return res
          .status(400)
          .json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage
        .from("shop_by_stores")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("shop_by_stores")
      .insert([{ title, image_url: imageUrl, subtitle }])
      .select()
      .single();
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, shopByStore: data });
  } catch (error) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update shop by store
const updateShopByStore = async (req, res) => {
  const { id } = req.params;
  try {
    const { title, subtitle } = req.body;
    const imageFile = req.file;
    let updateData = { title, subtitle };

    // Update image if a new one is provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("shop_by_stores")
        .upload(fileName, imageFile.buffer, {
          contentType: imageFile.mimetype,
          upsert: true,
        });
      if (uploadError)
        return res
          .status(400)
          .json({ success: false, error: uploadError.message });
      const { data: urlData } = supabase.storage
        .from("shop_by_stores")
        .getPublicUrl(fileName);
      updateData.image_url = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("shop_by_stores")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, shopByStore: data });
  } catch (error) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete shop by store
const deleteShopByStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("shop_by_stores")
      .delete()
      .eq("id", id);
    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, message: "Shop By Store deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export {
  getAllShopByStores,
  getShopByStoreById,
  createShopByStore,
  updateShopByStore,
  deleteShopByStore,
};
