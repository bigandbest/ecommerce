import { supabase } from '../config/supabaseClient.js';

// Get product variants
const getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching variants',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add product variant (Admin)
const addProductVariant = async (req, res) => {
  try {
    const {
      product_id,
      variant_name,
      variant_value,
      price,
      mrp,
      stock_quantity,
      sku,
      weight,
      dimensions
    } = req.body;

    const { data, error } = await supabase
      .from('product_variants')
      .insert([{
        product_id,
        variant_name,
        variant_value,
        price,
        mrp,
        stock_quantity,
        sku,
        weight,
        dimensions
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error adding variant',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Variant added successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update product variant (Admin)
const updateProductVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('product_variants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating variant',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Variant updated successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete product variant (Admin)
const deleteProductVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('product_variants')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting variant',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Variant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export {
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant
};