import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to a B&B Group using IDs
export const mapProductToBandBGroup = async (req, res) => {
  try {
    const { product_id, bnb_group_id } = req.body;

    if (!product_id || !bnb_group_id) {
      return res.status(400).json({ error: 'product_id and bnb_group_id are required.' });
    }

    // Insert mapping (ignore if duplicate)
    const { error } = await supabase
      .from('bnb_group_product')
      .insert([{ product_id, "bnb_group_id": bnb_group_id }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Mapping already exists.' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product mapped to B&B Group successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2️⃣ Remove a product from a B&B Group
export const removeProductFromBandBGroup = async (req, res) => {
  try {
    const { product_id, bnb_group_id } = req.body;

    const { error } = await supabase
      .from('bnb_group_product')
      .delete()
      .eq('product_id', product_id)
      .eq('bnb_group_id', bnb_group_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Mapping removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3️⃣ Get all B&B Groups stocking a product
export const getBandBGroupsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from('bnb_group_product')
      .select('bnb_group_id, "bnb_group" (id, name, image_url)')
      .eq('product_id', product_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4️⃣ Get all products in a B&B Group
export const getProductsForBandBGroup = async (req, res) => {
  try {
    const { bnb_group_id } = req.params;

    const { data, error } = await supabase
      .from('bnb_group_product')
      .select('product_id, products (id, name, price, rating, image, category, uom, discount)')
      .eq('bnb_group_id', bnb_group_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5️⃣ Bulk map products by names and B&B Group name
export const bulkMapByNames = async (req, res) => {
  try {
    const { bnb_group_name, product_names } = req.body;

    if (!bnb_group_name || !product_names || !Array.isArray(product_names)) {
      return res.status(400).json({ error: 'bnb_group_name and product_names[] are required.' });
    }

    // 1. Get B&B Group ID from name
    const { data: bnbGroupData, error: bnbGroupError } = await supabase
      .from('bnb_group')
      .select('id')
      .eq('name', bnb_group_name)
      .single();

    if (bnbGroupError || !bnbGroupData) {
      return res.status(404).json({ error: 'B&B Group not found.' });
    }

    // 2. Get product IDs from names
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .in('name', product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: 'No matching products found.' });
    }

    // 3. Map each product to B&B Group
    const inserts = products.map(p => ({
      product_id: p.id,
      "bnb_group_id": bnbGroupData.id
    }));

    const { error: insertError } = await supabase
      .from('bnb_group_product')
      .insert(inserts, { upsert: false });

    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to B&B Group "${bnb_group_name}".`,
      mapped_products: products.map(p => p.name)
    });

  } catch (err) {
    console.error('Bulk map error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};