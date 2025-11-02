import { supabase } from "../config/supabaseClient.js";

// Get all product sections
export const getAllProductSections = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("product_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching product sections:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get active product sections only
export const getActiveProductSections = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("product_sections")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching active product sections:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single product section by ID
export const getProductSectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("product_sections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product section not found" });
      }
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching product section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update product section
export const updateProductSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove id from update data if present
    delete updateData.id;
    delete updateData.created_at;

    const { data, error } = await supabase
      .from("product_sections")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product section not found" });
      }
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      data,
      message: "Product section updated successfully",
    });
  } catch (error) {
    console.error("Error updating product section:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Toggle section active status
export const toggleSectionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: currentSection, error: fetchError } = await supabase
      .from("product_sections")
      .select("is_active")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Product section not found" });
      }
      console.error("Supabase error:", fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    // Toggle status
    const newStatus = !currentSection.is_active;

    const { data, error } = await supabase
      .from("product_sections")
      .update({ is_active: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      data,
      message: `Section ${
        newStatus ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("Error toggling section status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update display order for multiple sections
export const updateSectionOrder = async (req, res) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({
        error: "sections array is required",
      });
    }

    // Update each section's display order
    const updates = sections.map((section) =>
      supabase
        .from("product_sections")
        .update({ display_order: section.display_order })
        .eq("id", section.id)
    );

    const results = await Promise.all(updates);

    // Check for errors
    const errorResults = results.filter((result) => result.error);
    if (errorResults.length > 0) {
      console.error("Supabase errors:", errorResults);
      return res.status(500).json({
        error: "Failed to update some sections",
        details: errorResults.map((r) => r.error.message),
      });
    }

    res.status(200).json({
      success: true,
      message: "Section order updated successfully",
    });
  } catch (error) {
    console.error("Error updating section order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
