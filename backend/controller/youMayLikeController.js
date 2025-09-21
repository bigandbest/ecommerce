import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to the 'you_may_like' table
export const mapProductToYouMayLike = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required.' });
    }

    // Insert mapping (ignore if duplicate)
    const { error } = await supabase
      .from('you_may_like')
      .insert([{ product_id }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Product is already in "You May Like".' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product added to "You May Like" successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2️⃣ Remove a product from the 'you_may_like' table
export const removeProductFromYouMayLike = async (req, res) => {
  try {
    const { product_id } = req.body;

    const { error } = await supabase
      .from('you_may_like')
      .delete()
      .eq('product_id', product_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Product removed from "You May Like" successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3️⃣ Get all products from the 'you_may_like' table
export const getYouMayLikeProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('you_may_like')
      .select('product_id, products (id, name, price, rating, image, category)');

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4️⃣ Get a single product by ID from the 'you_may_like' table
export const getYouMayLikeProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('you_may_like')
      .select('product_id, products (id, name, price, rating, image, category)')
      .eq('product_id', id)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5️⃣ Bulk add products to 'you_may_like' by product name
export const bulkAddByNames = async (req, res) => {
  try {
    const { product_names } = req.body;

    if (!product_names || !Array.isArray(product_names)) {
      return res.status(400).json({ error: 'product_names[] are required.' });
    }

    // 1. Get product IDs from names
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .in('name', product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: 'No matching products found.' });
    }

    // 2. Map each product to 'you_may_like'
    const inserts = products.map(p => ({
      product_id: p.id
    }));

    const { error: insertError } = await supabase
      .from('you_may_like')
      .insert(inserts, { upsert: false });

    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to "You May Like".`,
      mapped_products: products.map(p => p.name)
    });

  } catch (err) {
    console.error('Bulk map error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};