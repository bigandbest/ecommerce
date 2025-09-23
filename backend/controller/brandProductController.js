import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to a Brand using IDs
export const mapProductToBrand = async (req, res) => {
  try {
    const { product_id, brand_id } = req.body;

    if (!product_id || !brand_id) {
      return res.status(400).json({ error: 'product_id and brand_id are required.' });
    }

    // Insert mapping (ignore if duplicate)
    const { error } = await supabase
      .from('product_brand')
      .insert([{ product_id, brand_id }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Mapping already exists.' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product mapped to Brand successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2️⃣ Remove a product from a Brand
export const removeProductFromBrand = async (req, res) => {
  try {
    const { product_id, brand_id } = req.body;

    const { error } = await supabase
      .from('product_brand')
      .delete()
      .eq('product_id', product_id)
      .eq('brand_id', brand_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Mapping removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3️⃣ Get all Brands stocking a product
export const getBrandsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from('product_brand')
      .select('brand_id, brand (id, name, image_url)')
      .eq('product_id', product_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4️⃣ Get all products from a Brand
export const getProductsForBrand = async (req, res) => {
  try {
    const { brand_id } = req.params;

    const { data, error } = await supabase
      .from('product_brand')
      .select('product_id, products (id, name, price, rating, image, category)')
      .eq('brand_id', brand_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5️⃣ Bulk map products by names and Brand name
export const bulkMapByNames = async (req, res) => {
  try {
    const { brand_name, product_names } = req.body;

    if (!brand_name || !product_names || !Array.isArray(product_names)) {
      return res.status(400).json({ error: 'brand_name and product_names[] are required.' });
    }

    // 1. Get Brand ID from name
    const { data: brandData, error: brandError } = await supabase
      .from('brand')
      .select('id')
      .eq('name', brand_name)
      .single();

    if (brandError || !brandData) {
      return res.status(404).json({ error: 'Brand not found.' });
    }

    // 2. Get product IDs from names
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .in('name', product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: 'No matching products found.' });
    }

    // 3. Map each product to Brand
    const inserts = products.map(p => ({
      product_id: p.id,
      brand_id: brandData.id
    }));

    const { error: insertError } = await supabase
      .from('product_brand')
      .insert(inserts, { upsert: false });

    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to Brand "${brand_name}".`,
      mapped_products: products.map(p => p.name)
    });

  } catch (err) {
    console.error('Bulk map error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};