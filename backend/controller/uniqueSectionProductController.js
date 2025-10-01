import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to a Unique Section using IDs
export const mapProductToUniqueSection = async (req, res) => {
  try {
    const { product_id, unique_section_id } = req.body; // 👈 unique_section_id instead of brand_id

    if (!product_id || !unique_section_id) {
      return res.status(400).json({ error: 'product_id and unique_section_id are required.' });
    }

    // Insert mapping (ignore if duplicate)
    const { error } = await supabase
      .from('unique_section_product') // 👈 Using the new table
      .insert([{ product_id, unique_section_id }]);

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Mapping already exists.' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Product mapped to Unique Section successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2️⃣ Remove a product from a Unique Section
export const removeProductFromUniqueSection = async (req, res) => {
  try {
    const { product_id, unique_section_id } = req.body;

    const { error } = await supabase
      .from('unique_section_product') // 👈 Using the new table
      .delete()
      .eq('product_id', product_id)
      .eq('unique_section_id', unique_section_id); // 👈 unique_section_id instead of brand_id

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Mapping removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 3️⃣ Get all Unique Sections stocking a product
export const getUniqueSectionsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from('unique_section_product') // 👈 Using the new table
      .select('unique_section_id, unique_section (id, name, image_url, section_type)') // 👈 Fetching unique_section details
      .eq('product_id', product_id);

    if (error) return res.status(500).json({ error: error.message });

    // The 'data' will contain an array of objects like:
    // { unique_section_id: '...', unique_section: { id: '...', name: '...', ... } }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 4️⃣ Get all products from a Unique Section
export const getProductsForUniqueSection = async (req, res) => {
  try {
    const { unique_section_id } = req.params; // 👈 unique_section_id instead of brand_id

    const { data, error } = await supabase
      .from('unique_section_product') // 👈 Using the new table
      .select('product_id, products (id, name, price, rating, image, category)')
      .eq('unique_section_id', unique_section_id); // 👈 unique_section_id instead of brand_id

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 5️⃣ Bulk map products by names and Unique Section name
export const bulkMapUniqueSectionByNames = async (req, res) => {
  try {
    const { section_name, product_names } = req.body; // 👈 section_name instead of brand_name

    if (!section_name || !product_names || !Array.isArray(product_names)) {
      return res.status(400).json({ error: 'section_name and product_names[] are required.' });
    }

    // 1. Get Unique Section ID from name
    const { data: sectionData, error: sectionError } = await supabase
      .from('unique_section') // 👈 Using the unique_section table
      .select('id')
      .eq('name', section_name)
      .single();

    if (sectionError || !sectionData) {
      return res.status(404).json({ error: 'Unique Section not found.' });
    }

    // 2. Get product IDs from names
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .in('name', product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: 'No matching products found.' });
    }

    // 3. Map each product to Unique Section
    const inserts = products.map(p => ({
      product_id: p.id,
      unique_section_id: sectionData.id // 👈 unique_section_id instead of brand_id
    }));

    const { error: insertError } = await supabase
      .from('unique_section_product') // 👈 Using the new table
      .insert(inserts, { upsert: false });

    if (insertError && insertError.code !== '23505') {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to Unique Section "${section_name}".`,
      mapped_products: products.map(p => p.name)
    });

  } catch (err) {
    console.error('Bulk map error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};