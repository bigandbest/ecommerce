import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to a Quick Pick Group using IDs
export const mapProductToQuickPickGroup = async (req, res) => {
  try {
    const { product_id, quick_pick_group_id } = req.body;

    if (!product_id || !quick_pick_group_id) {
      return res.status(400).json({ error: 'product_id and quick_pick_group_id are required.' });
    }

    // Insert mapping (ignore if duplicate)
    const { error } = await supabase
      .from('quickpick_group_product')
      .insert([{ product_id, quick_pick_group_id }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Mapping already exists.' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product mapped to Quick Pick Group successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2️⃣ Remove a product from a Quick Pick Group
export const removeProductFromQuickPickGroup = async (req, res) => {
  try {
    const { product_id, quick_pick_group_id } = req.body;

    const { error } = await supabase
      .from('quickpick_group_product')
      .delete()
      .eq('product_id', product_id)
      .eq('quick_pick_group_id', quick_pick_group_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Mapping removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3️⃣ Get all Quick Pick Groups stocking a product
export const getQuickPickGroupsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from('quickpick_group_product')
      .select('quick_pick_group_id, quick_pick_group (id, name, image_url)')
      .eq('product_id', product_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4️⃣ Get all products in a Quick Pick Group thiss
export const getProductsForQuickPickGroup = async (req, res) => {
  try {
    const { quick_pick_group_id } = req.params;

    const { data, error } = await supabase
      .from('quickpick_group_product')
      // 👇 Add 'discount' and 'uom' to this line
      .select('product_id, products (id, name, price, rating, image, category, discount, uom)')
      .eq('quick_pick_group_id', quick_pick_group_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5️⃣ Bulk map products by names and Quick Pick Group name
export const bulkMapByNames = async (req, res) => {
  try {
    const { quick_pick_group_name, product_names } = req.body;

    if (!quick_pick_group_name || !product_names || !Array.isArray(product_names)) {
      return res.status(400).json({ error: 'quick_pick_group_name and product_names[] are required.' });
    }

    // 1. Get Quick Pick Group ID from name
    const { data: quickPickGroupData, error: quickPickGroupError } = await supabase
      .from('quick_pick_group')
      .select('id')
      .eq('name', quick_pick_group_name)
      .single();

    if (quickPickGroupError || !quickPickGroupData) {
      return res.status(404).json({ error: 'Quick Pick Group not found.' });
    }

    // 2. Get product IDs from names
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .in('name', product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: 'No matching products found.' });
    }

    // 3. Map each product to Quick Pick Group
    const inserts = products.map(p => ({
      product_id: p.id,
      quick_pick_group_id: quickPickGroupData.id
    }));

    const { error: insertError } = await supabase
      .from('quickpick_group_product')
      .insert(inserts, { upsert: false });

    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to Quick Pick Group "${quick_pick_group_name}".`,
      mapped_products: products.map(p => p.name)
    });

  } catch (err) {
    console.error('Bulk map error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};