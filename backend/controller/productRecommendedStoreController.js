import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to a Recommended Store using IDs
export const mapProductToRecommendedStore = async (req, res) => {
  try {
    const { product_id, recommended_store_id } = req.body;

    if (!product_id || !recommended_store_id) {
      return res.status(400).json({ error: 'product_id and recommended_store_id are required.' });
    }

    // Insert mapping (ignore if duplicate)
    const { error } = await supabase
      .from('product_recommended_store')
      .insert([{ product_id, recommended_store_id }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Mapping already exists.' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product mapped to Recommended Store successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2️⃣ Remove a product from a Recommended Store
export const removeProductFromRecommendedStore = async (req, res) => {
  try {
    const { product_id, recommended_store_id } = req.body;

    const { error } = await supabase
      .from('product_recommended_store')
      .delete()
      .eq('product_id', product_id)
      .eq('recommended_store_id', recommended_store_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Mapping removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3️⃣ Get all Recommended Stores stocking a product
export const getRecommendedStoresForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from('product_recommended_store')
      .select('recommended_store_id, recommended_store (id, name, image_url)')
      .eq('product_id', product_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4️⃣ Get all products in a Recommended Store
export const getProductsForRecommendedStore = async (req, res) => {
  try {
    const { recommended_store_id } = req.params;

    const { data, error } = await supabase
      .from('product_recommended_store')
      .select('product_id, products (id, name, price, rating, image, category)')
      .eq('recommended_store_id', recommended_store_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5️⃣ Bulk map products by names and Recommended Store name
export const bulkMapByNames = async (req, res) => {
  try {
    const { recommended_store_name, product_names } = req.body;

    if (!recommended_store_name || !product_names || !Array.isArray(product_names)) {
      return res.status(400).json({ error: 'recommended_store_name and product_names[] are required.' });
    }

    // 1. Get Recommended Store ID from name
    const { data: recommendedStoreData, error: recommendedStoreError } = await supabase
      .from('recommended_store')
      .select('id')
      .eq('name', recommended_store_name)
      .single();

    if (recommendedStoreError || !recommendedStoreData) {
      return res.status(404).json({ error: 'Recommended Store not found.' });
    }

    // 2. Get product IDs from names
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .in('name', product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: 'No matching products found.' });
    }

    // 3. Map each product to Recommended Store
    const inserts = products.map(p => ({
      product_id: p.id,
      recommended_store_id: recommendedStoreData.id
    }));

    const { error: insertError } = await supabase
      .from('product_recommended_store')
      .insert(inserts, { upsert: false });

    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to Recommended Store "${recommended_store_name}".`,
      mapped_products: products.map(p => p.name)
    });

  } catch (err) {
    console.error('Bulk map error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};