import { supabase } from "../config/supabaseClient.js";

// 1) Map a product to a Section (unchanged)
export const mapProductToSection = async (req, res) => {
  try {
    const { product_id, section_id } = req.body;
    if (!product_id || !section_id) {
      return res.status(400).json({ error: "product_id and section_id are required." });
    }

    const { error } = await supabase
      .from("unique_section_products")
      .insert([{ product_id, unique_section_id: section_id }]);

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "Mapping already exists." });
      }
      return res.status(500).json({ error: `Supabase insert error: ${error.message}` });
    }

    res.status(201).json({ message: "Product mapped successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 2) Remove product from Section (unchanged)
export const removeProductFromSection = async (req, res) => {
  try {
    const { product_id, section_id } = req.body;
    if (!product_id || !section_id) {
      return res.status(400).json({ error: "product_id and section_id are required." });
    }

    const { error } = await supabase
      .from("unique_section_products")
      .delete()
      .eq("product_id", product_id)
      .eq("unique_section_id", section_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: "Product removed from section." });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 3) Get all products in a section  ✅ FIXED (two-step)
export const getProductsForSection = async (req, res) => {
  try {
    const { section_id } = req.params;

    // step 1: fetch product_ids
    const { data: links, error: linkErr } = await supabase
      .from("unique_section_products")
      .select("product_id")
      .eq("unique_section_id", section_id);

    if (linkErr) return res.status(500).json({ error: linkErr.message });
    if (!links || links.length === 0) return res.status(200).json([]);

    const ids = links.map(l => l.product_id);

    // step 2: fetch products by ids
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, rating, image")
      .in("id", ids);

    if (prodErr) return res.status(500).json({ error: prodErr.message });

    // frontend expects an array of products
    res.status(200).json(products);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 4) Get all sections for a product  ✅ FIXED (two-step)
export const getSectionsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    // step 1: fetch section ids
    const { data: links, error: linkErr } = await supabase
      .from("unique_section_products")
      .select("unique_section_id")
      .eq("product_id", product_id);

    if (linkErr) return res.status(500).json({ error: linkErr.message });
    if (!links || links.length === 0) return res.status(200).json([]);

    const sectionIds = links.map(l => l.unique_section_id);

    // step 2: fetch sections
    const { data: sections, error: secErr } = await supabase
      .from("unique_section")
      .select("id, name, image_url, section_type")
      .in("id", sectionIds);

    if (secErr) return res.status(500).json({ error: secErr.message });

    res.status(200).json(sections);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 5) Bulk map products (unchanged except for column name already fixed)
export const bulkMapByNames = async (req, res) => {
  try {
    const { section_name, product_names } = req.body;
    if (!section_name || !Array.isArray(product_names)) {
      return res.status(400).json({ error: "section_name and product_names[] are required." });
    }

    const { data: sectionData, error: sectionError } = await supabase
      .from("unique_section")
      .select("id")
      .eq("name", section_name)
      .single();

    if (sectionError || !sectionData) {
      return res.status(404).json({ error: "Section not found." });
    }

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .in("name", product_names);

    if (productError || !products?.length) {
      return res.status(404).json({ error: "Products not found." });
    }

    const inserts = products.map(p => ({
      product_id: p.id,
      unique_section_id: sectionData.id,
    }));

    const { error: insertError } = await supabase
      .from("unique_section_products")
      .insert(inserts);

    if (insertError) {
      return res.status(500).json({ error: `Supabase bulk insert error: ${insertError.message}` });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to ${section_name}`,
      mapped_products: products.map(p => p.name),
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 6) Get all products (unchanged)
export const getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

// 7) Get section details (unchanged)
export const getSectionById = async (req, res) => {
  try {
    const { section_id } = req.params;
    const { data, error } = await supabase
      .from("unique_section")
      .select("*")
      .eq("id", section_id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Section not found" });
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};
