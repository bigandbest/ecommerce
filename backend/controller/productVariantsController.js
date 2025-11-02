import { supabase } from "../config/supabaseClient.js";

// Get all variants for a product
export const getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("active", true)
      .order("variant_price", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      variants: data || [],
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add variant to product
export const addProductVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      variant_name,
      variant_price,
      variant_old_price,
      variant_discount,
      variant_stock,
      variant_weight,
      variant_unit,
      shipping_amount,
      is_default,
    } = req.body;

    const { data, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        variant_name,
        variant_price,
        variant_old_price,
        variant_discount,
        variant_stock,
        variant_weight,
        variant_unit,
        shipping_amount,
        is_default,
      })
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      variant: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update product variant
export const updateProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from("product_variants")
      .update({ ...updateData, updated_at: new Date() })
      .eq("id", variantId)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      variant: data[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete product variant
export const deleteProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get products with their variants
export const getProductsWithVariants = async (req, res) => {
  try {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (
          id,
          variant_name,
          variant_price,
          variant_old_price,
          variant_discount,
          variant_stock,
          variant_weight,
          variant_unit,
          shipping_amount,
          is_default,
          active
        )
      `
      )
      .eq("active", true);

    if (productsError) {
      return res.status(500).json({ error: productsError.message });
    }

    res.status(200).json({
      success: true,
      products: products,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
