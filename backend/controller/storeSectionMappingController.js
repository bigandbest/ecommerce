import { supabase } from "../config/supabaseClient.js";

// Get all product sections
export async function getAllProductSections(req, res) {
  try {
    const { data, error } = await supabase
      .from("product_sections")
      .select("*")
      .order("display_order");

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, sections: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Create store-section mapping
export async function createStoreSectionMapping(req, res) {
  try {
    const { store_id, section_ids } = req.body;

    // Create mappings for each section
    const mappings = section_ids.map((section_id) => ({
      store_id: store_id,
      section_id: parseInt(section_id),
      mapping_type: "store_section",
      is_active: true,
    }));

    const { data, error } = await supabase
      .from("store_section_mappings")
      .insert(mappings)
      .select();

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, mappings: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Create section-product mapping
export async function createSectionProductMapping(req, res) {
  try {
    const { section_id, product_ids } = req.body;

    // Create mappings for each product
    const mappings = product_ids.map((product_id) => ({
      section_id: parseInt(section_id),
      product_id: product_id,
      mapping_type: "section_product",
      is_active: true,
    }));

    const { data, error } = await supabase
      .from("store_section_mappings")
      .insert(mappings)
      .select();

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.status(201).json({ success: true, mappings: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all mappings with related data
export async function getAllMappings(req, res) {
  try {
    // Get store-section mappings
    const { data: storeSectionData, error: storeSectionError } = await supabase
      .from("store_section_mappings")
      .select(
        `
        *,
        recommended_store:store_id(*),
        product_sections:section_id(*)
      `
      )
      .eq("mapping_type", "store_section");

    if (storeSectionError) {
      console.error("Store section error:", storeSectionError);
    }

    // Get section-product mappings
    const { data: sectionProductData, error: sectionProductError } =
      await supabase
        .from("store_section_mappings")
        .select(
          `
        *,
        product_sections:section_id(*),
        products:product_id(*)
      `
        )
        .eq("mapping_type", "section_product");

    if (sectionProductError) {
      console.error("Section product error:", sectionProductError);
    }

    // Group mappings by type
    const groupedStoreSections = {};
    const groupedSectionProducts = {};

    // Group store-section mappings by store
    (storeSectionData || []).forEach((mapping) => {
      const storeId = mapping.store_id;
      if (!groupedStoreSections[storeId]) {
        groupedStoreSections[storeId] = {
          id: `store_${storeId}`,
          type: "store-section",
          store_id: storeId,
          store_name: mapping.recommended_store?.name || "Unknown Store",
          sections: [],
          is_active: true,
        };
      }
      if (mapping.product_sections) {
        groupedStoreSections[storeId].sections.push(mapping.product_sections);
      }
    });

    // Group section-product mappings by section
    (sectionProductData || []).forEach((mapping) => {
      const sectionId = mapping.section_id;
      if (!groupedSectionProducts[sectionId]) {
        groupedSectionProducts[sectionId] = {
          id: `section_${sectionId}`,
          type: "section-product",
          section_id: sectionId,
          section_name:
            mapping.product_sections?.section_name || "Unknown Section",
          products: [],
          is_active: true,
        };
      }
      if (mapping.products) {
        groupedSectionProducts[sectionId].products.push(mapping.products);
      }
    });

    const allMappings = [
      ...Object.values(groupedStoreSections),
      ...Object.values(groupedSectionProducts),
    ];

    res.json({ success: true, mappings: allMappings });
  } catch (err) {
    console.error("Get all mappings error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// Update mapping status
export async function updateMappingStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const { data, error } = await supabase
      .from("store_section_mappings")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error)
      return res.status(400).json({ success: false, error: error.message });
    res.json({ success: true, mapping: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Delete mapping (supports both individual records and grouped deletions)
export async function deleteMapping(req, res) {
  try {
    const { id } = req.params;

    // Check if it's a grouped ID (store_123 or section_456)
    if (id.startsWith("store_")) {
      // Delete all store-section mappings for this store
      const storeId = id.replace("store_", "");
      const { error } = await supabase
        .from("store_section_mappings")
        .delete()
        .eq("store_id", storeId)
        .eq("mapping_type", "store_section");

      if (error)
        return res.status(400).json({ success: false, error: error.message });
      res.json({
        success: true,
        message: "Store-section mappings deleted successfully",
      });
    } else if (id.startsWith("section_")) {
      // Delete all section-product mappings for this section
      const sectionId = id.replace("section_", "");
      const { error } = await supabase
        .from("store_section_mappings")
        .delete()
        .eq("section_id", parseInt(sectionId))
        .eq("mapping_type", "section_product");

      if (error)
        return res.status(400).json({ success: false, error: error.message });
      res.json({
        success: true,
        message: "Section-product mappings deleted successfully",
      });
    } else {
      // Delete individual mapping record
      const { error } = await supabase
        .from("store_section_mappings")
        .delete()
        .eq("id", id);

      if (error)
        return res.status(400).json({ success: false, error: error.message });
      res.json({ success: true, message: "Mapping deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get products by section for frontend
export async function getProductsBySection(req, res) {
  try {
    const { section_key } = req.params;

    // Get section info
    const { data: sectionData, error: sectionError } = await supabase
      .from("product_sections")
      .select("*")
      .eq("section_key", section_key)
      .eq("is_active", true)
      .single();

    if (sectionError || !sectionData) {
      return res
        .status(404)
        .json({ success: false, error: "Section not found" });
    }

    let allProducts = [];
    let directMappingsData = null;
    let storeProductsData = null;

    // First, get direct section-product mappings
    const { data: directMappings, error: directMappingsError } = await supabase
      .from("store_section_mappings")
      .select(
        `
        products!inner(*)
      `
      )
      .eq("section_id", sectionData.id)
      .eq("mapping_type", "section_product")
      .eq("is_active", true);

    if (!directMappingsError && directMappings) {
      directMappingsData = directMappings;
      const directProducts = directMappings.map((mapping) => mapping.products);
      allProducts = [...allProducts, ...directProducts];
    }

    // Also get products from stores mapped to this section
    const { data: storeMappingsData, error: storeMappingsError } =
      await supabase
        .from("store_section_mappings")
        .select("store_id")
        .eq("section_id", sectionData.id)
        .eq("mapping_type", "store_section")
        .eq("is_active", true);

    if (
      !storeMappingsError &&
      storeMappingsData &&
      storeMappingsData.length > 0
    ) {
      const storeIds = storeMappingsData.map((mapping) => mapping.store_id);

      // Get products from these stores (limit to recent/top products)
      const { data: storeProducts, error: storeProductsError } = await supabase
        .from("products")
        .select("*")
        .in("store_id", storeIds)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(10); // Limit to 10 products per store-section

      if (!storeProductsError && storeProducts) {
        storeProductsData = storeProducts;
        allProducts = [...allProducts, ...storeProducts];
      }
    }

    // Remove duplicates based on product id (in case a product is both directly mapped and from a mapped store)
    const uniqueProducts = allProducts.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
    );

    res.json({
      success: true,
      section: sectionData,
      products: uniqueProducts,
      mapping_types: {
        direct_products: directMappingsData ? directMappingsData.length : 0,
        store_products: storeProductsData ? storeProductsData.length : 0,
        total_unique_products: uniqueProducts.length,
      },
    });
  } catch (err) {
    console.error("Get products by section error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
