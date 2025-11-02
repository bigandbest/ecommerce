import { supabase } from "../config/supabaseClient.js";

// Get single product with bulk settings
export const getProductBulkSettings = async (req, res) => {
  try {
    const { product_id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        discounted_single_product_price,
        bulk_product_settings (
          min_quantity,
          bulk_price,
          discount_percentage,
          is_bulk_enabled
        )
      `)
      .eq('id', product_id)
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, product: data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get all products with bulk settings
export const getBulkProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        image,
        price,
        bulk_product_settings (
          id,
          min_quantity,
          bulk_price,
          discount_percentage,
          is_bulk_enabled
        )
      `)
      .order('name');

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, products: data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Update bulk settings for a product
export const updateBulkSettings = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { min_quantity, bulk_price, discount_percentage, is_bulk_enabled } = req.body;

    // Check if bulk settings exist
    const { data: existing } = await supabase
      .from('bulk_product_settings')
      .select('id')
      .eq('product_id', product_id)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('bulk_product_settings')
        .update({
          min_quantity,
          bulk_price,
          discount_percentage,
          is_bulk_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', product_id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Create new
      const { data, error } = await supabase
        .from('bulk_product_settings')
        .insert([{
          product_id,
          min_quantity,
          bulk_price,
          discount_percentage,
          is_bulk_enabled
        }])
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      return res.status(500).json({ success: false, error: result.error.message });
    }

    return res.json({ success: true, settings: result.data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};