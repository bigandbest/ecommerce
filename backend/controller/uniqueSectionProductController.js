import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Map a single product to a Unique Section
export const mapProductToSection = async (req, res) => {
  try {
    const { product_id, section_id } = req.body;

    if (!product_id || !section_id) {
      return res.status(400).json({ error: "product_id and section_id are required." });
    }

    const { error } = await supabase
      .from("unique_section_products")
      .insert([{ product_id, section_id }]);

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "Mapping already exists." });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Product mapped to Section successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 2️⃣ Remove a product from a Unique Section
export const removeProductFromSection = async (req, res) => {
  try {
    const { product_id, section_id } = req.body;

    const { error } = await supabase
      .from("unique_section_products")
      .delete()
      .eq("product_id", product_id)
      .eq("section_id", section_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: "Mapping removed successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 3️⃣ Get all Sections containing a product
export const getSectionsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const { data, error } = await supabase
      .from("unique_section_products")
      .select("section_id, unique_section (id, name, description, image_url)")
      .eq("product_id", product_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 4️⃣ Get all Products in a Unique Section
export const getProductsForSection = async (req, res) => {
  try {
    const { section_id } = req.params;

    const { data, error } = await supabase
      .from("unique_section_products")
      .select("product_id, products (id, name, price, rating, image, category)")
      .eq("section_id", section_id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 5️⃣ Bulk map products by names and Section name
export const bulkMapByNames = async (req, res) => {
  try {
    const { section_name, product_names } = req.body;

    if (!section_name || !product_names || !Array.isArray(product_names)) {
      return res
        .status(400)
        .json({ error: "section_name and product_names[] are required." });
    }

    // 1. Get Section ID
    const { data: sectionData, error: sectionError } = await supabase
      .from("unique_section")
      .select("id")
      .eq("name", section_name)
      .single();

    if (sectionError || !sectionData) {
      return res.status(404).json({ error: "Section not found." });
    }

    // 2. Get product IDs
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .in("name", product_names);

    if (productError || !products.length) {
      return res.status(404).json({ error: "No matching products found." });
    }

    // 3. Insert mappings
    const inserts = products.map((p) => ({
      product_id: p.id,
      section_id: sectionData.id,
    }));

    const { error: insertError } = await supabase
      .from("unique_section_products")
      .insert(inserts, { upsert: false });

    if (insertError && insertError.code !== "23505") {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({
      message: `Mapped ${products.length} products to Section "${section_name}".`,
      mapped_products: products.map((p) => p.name),
    });
  } catch (err) {
    console.error("Bulk map error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
