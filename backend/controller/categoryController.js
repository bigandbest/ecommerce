import { supabase } from "../config/supabaseClient.js";

// Get all subcategories with their category info
export const getAllSubcategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("subcategories")
      .select(
        `
        *,
        categories (
          id,
          name,
          image_url,
          icon
        )
      `
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      subcategories: data,
      total: data.length,
    });
  } catch (error) {
    console.error("Server error in getAllSubcategories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get subcategories by category ID
export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      subcategories: data,
      total: data.length,
    });
  } catch (error) {
    console.error("Server error in getSubcategoriesByCategory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all groups with their subcategory and category info
export const getAllGroups = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("groups")
      .select(
        `
        *,
        subcategories (
          id,
          name,
          image_url,
          icon,
          categories (
            id,
            name,
            image_url,
            icon
          )
        )
      `
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      groups: data,
      total: data.length,
    });
  } catch (error) {
    console.error("Server error in getAllGroups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get groups by subcategory ID
export const getGroupsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("subcategory_id", subcategoryId)
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      groups: data,
      total: data.length,
    });
  } catch (error) {
    console.error("Server error in getGroupsBySubcategory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get categories with their subcategories and groups (full hierarchy)
export const getCategoriesHierarchy = async (req, res) => {
  try {
    // Get categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("name");

    if (catError) {
      console.error("Categories error:", catError);
      return res.status(500).json({ error: catError.message });
    }

    // Get subcategories with category_id
    const { data: subcategories, error: subError } = await supabase
      .from("subcategories")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    if (subError) {
      console.error("Subcategories error:", subError);
      return res.status(500).json({ error: subError.message });
    }

    // Get groups with subcategory_id
    const { data: groups, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    if (groupError) {
      console.error("Groups error:", groupError);
      return res.status(500).json({ error: groupError.message });
    }

    // Build hierarchy
    const hierarchy = categories.map((category) => ({
      ...category,
      subcategories: subcategories
        .filter((sub) => sub.category_id === category.id)
        .map((subcategory) => ({
          ...subcategory,
          groups: groups.filter(
            (group) => group.subcategory_id === subcategory.id
          ),
        })),
    }));

    res.status(200).json({
      success: true,
      categories: hierarchy,
      total: hierarchy.length,
    });
  } catch (error) {
    console.error("Server error in getCategoriesHierarchy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get subcategory details with category info
export const getSubcategoryDetails = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const { data, error } = await supabase
      .from("subcategories")
      .select(
        `
        *,
        categories (
          id,
          name,
          image_url,
          icon
        )
      `
      )
      .eq("id", subcategoryId)
      .eq("active", true)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      subcategory: data,
    });
  } catch (error) {
    console.error("Server error in getSubcategoryDetails:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
