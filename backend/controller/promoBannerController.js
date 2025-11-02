import { supabase } from "../config/supabaseClient.js";

// Get all promo banners
export const getAllPromoBanners = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("promo_banners")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      banners: data || [],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add promo banner
export const addPromoBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      discount,
      description,
      button_text,
      bg_color,
      accent_color,
      icon,
      category,
      link,
      display_order
    } = req.body;

    const { data, error } = await supabase
      .from("promo_banners")
      .insert({
        title,
        subtitle,
        discount,
        description,
        button_text: button_text || 'SHOP NOW',
        bg_color: bg_color || 'from-indigo-600 via-purple-600 to-pink-600',
        accent_color: accent_color || 'from-pink-400 to-rose-400',
        icon: icon || '💪',
        category,
        link,
        display_order: display_order || 0
      })
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      banner: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update promo banner
export const updatePromoBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from("promo_banners")
      .update({ ...updateData, updated_at: new Date() })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      banner: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete promo banner
export const deletePromoBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("promo_banners")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Toggle banner status
export const togglePromoBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const { data, error } = await supabase
      .from("promo_banners")
      .update({ active, updated_at: new Date() })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      banner: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};