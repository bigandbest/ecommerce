import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to a Saving Zone Group using IDs
export const mapProductToSavingZoneGroup = async (req, res) => {
  try {
    const { product_id, saving_zone_group_id } = req.body;

    if (!product_id || !saving_zone_group_id) {
      return res.status(400).json({ error: 'product_id and saving_zone_group_id are required.' });
    }

    // Insert mapping (ignore if duplicate)
    const { error } = await supabase
      .from('saving_zone_group_product')
      .insert([{ product_id, saving_zone_group_id }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Mapping already exists.' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product mapped to Saving Zone Group successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2️⃣ Remove a product from a Saving Zone Group
export const removeProductFromSavingZoneGroup = async (req, res) => {
  try {
    const { product_id, saving_zone_group_id } = req.body;

    const { error } = await supabase
      .from('saving_zone_group_product')
      .delete()
      .eq('product_id', product_id)
      .eq('saving_zone_group_id', saving_zone_group_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Mapping removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3️⃣ Get all Saving Zone Groups stocking a product
export const getSavingZoneGroupsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from('saving_zone_group_product')
      .select('saving_zone_group_id, saving_zone_group (id, name, image_url)')
      .eq('product_id', product_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4️⃣ Get all products in a Saving Zone Group
export const getProductsForSavingZoneGroup = async (req, res) => {
  try {
    const { saving_zone_group_id } = req.params;

    const { data, error } = await supabase
      .from('saving_zone_group_product')
      .select('product_id, products (id, name, price, rating, image, category, discount, uom)')
      .eq('saving_zone_group_id', saving_zone_group_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5️⃣ Bulk map products by names and Saving Zone Group name
export const bulkMapByNames = async (req, res) => {
  try {
    const { saving_zone_group_name, product_names } = req.body;

    if (!saving_zone_group_name || !product_names || !Array.isArray(product_names)) {
      return res.status(400).json({ error: 'saving_zone_group_name and product_names[] are required.' });
    }

    // 1. Get Saving Zone Group ID from name
    const { data: savingZoneGroupData, error: savingZoneGroupError } = await supabase
      .from('saving_zone_group')
      .select('id')
      .eq('name', saving_zone_group_name)
      .single();

    if (savingZoneGroupError || !savingZoneGroupData) {
      return res.status(404).json({ error: 'Saving Zone Group not found.' });
    }

    // 2. Get product IDs from names
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .in('name', product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: 'No matching products found.' });
    }

    // 3. Map each product to Saving Zone Group
    const inserts = products.map(p => ({
      product_id: p.id,
      saving_zone_group_id: savingZoneGroupData.id
    }));

    const { error: insertError } = await supabase
      .from('saving_zone_group_product')
      .insert(inserts, { upsert: false });

    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to Saving Zone Group "${saving_zone_group_name}".`,
      mapped_products: products.map(p => p.name)
    });

  } catch (err) {
    console.error('Bulk map error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// New functions added to match Quick Pick functionality
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