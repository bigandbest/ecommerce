import supabase from "./supabase.ts";
//Video Banner
// Get all video banners


export async function getAllVideoBanners() {
  const { data, error } = await supabase.from("video_banner").select();
  if (error) return { success: false, error: error.message };

  // Do NOT call getPublicUrl again — just return the data directly
  return { success: true, videoBanners: data };
}



// PRINT REQUESTS
/**
 * Uploads an image to the 'prints' bucket and creates a new print request in the 'print_requests' table.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.productType
 * @param {string} params.size
 * @param {string} params.color
 * @param {number} params.quantity
 * @param {string} params.position
 * @param {File} params.imageFile
 * @returns {Promise<{success: boolean, error?: string, request?: object}>}
 */
export async function createPrintRequest({
  userId,
  productType,
  size,
  color,
  quantity,
  position,
  imageFile,
}) {
  let imageUrl = null;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("prints")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("prints")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("print_requests")
    .insert([
      {
        user_id: userId,
        product_type: productType,
        size,
        color,
        quantity,
        position,
        image_url: imageUrl,
        status: "pending",
      },
    ])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, request: data };
}

/**
 * Creates both a print request and an enquiry for custom printing orders.
 * This allows custom printing requests to appear in enquiry history with chat functionality.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.productType
 * @param {string} params.size
 * @param {string} params.color
 * @param {number} params.quantity
 * @param {string} params.position
 * @param {File} params.imageFile
 * @param {string} params.name - User's name
 * @param {string} params.email - User's email
 * @param {string} params.phone - User's phone (optional)
 * @returns {Promise<{success: boolean, error?: string, request?: object, enquiry?: object}>}
 */
export async function createPrintRequestWithEnquiry({
  userId,
  productType,
  size,
  color,
  quantity,
  position,
  imageFile,
  name,
  email,
  phone,
  totalPrice,
}) {
  let imageUrl = null;

  // Upload image first
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("prints")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("prints")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }

  try {
    // 1. Create the print request with price information
    const { data: printRequest, error: printError } = await supabase
      .from("print_requests")
      .insert([
        {
          user_id: userId,
          product_type: productType,
          size,
          color,
          quantity,
          position,
          image_url: imageUrl,
          status: "pending",
          estimated_price: totalPrice || 0, // Store the calculated price from frontend
        },
      ])
      .select()
      .single();

    if (printError) {
      return { success: false, error: printError.message };
    }

    // 2. Create corresponding enquiry for chat functionality
    const enquiryMessage = `Custom printing request for ${productType}\n\nDetails:\n- Size: ${size}\n- Color: ${color}\n- Quantity: ${quantity}\n- Position: ${position}\n- Estimated Price: ₹${totalPrice || 0
      }\n\nImage: ${imageUrl || "No image uploaded"}`;

    const enquiryData = {
      user_id: userId,
      name,
      email,
      phone: phone || null,
      message: enquiryMessage,
    };

    // Add type field for custom printing
    enquiryData.type = "custom_printing";

    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .insert([enquiryData])
      .select()
      .single();

    if (enquiryError) {
      // If enquiry creation fails, we should clean up the print request
      await supabase.from("print_requests").delete().eq("id", printRequest.id);
      return { success: false, error: enquiryError.message };
    }

    // 3. Update print request with enquiry_id for linking
    await supabase
      .from("print_requests")
      .update({ enquiry_id: enquiry.id })
      .eq("id", printRequest.id);

    // 4. Create enquiry item for the custom print with calculated price
    const enquiryItem = {
      enquiry_id: enquiry.id,
      product_id: null, // No product ID for custom prints
      product_name: `Custom ${productType} - ${size}, ${color}`,
      price: totalPrice || 0, // Use the calculated price from frontend
      quantity: quantity,
      customization: `Position: ${position}, Image: ${imageUrl || "No image"}`,
    };

    const { error: itemError } = await supabase
      .from("enquiry_items")
      .insert([enquiryItem]);

    if (itemError) {
      // Clean up both records if item creation fails
      await supabase.from("print_requests").delete().eq("id", printRequest.id);
      await supabase.from("enquiries").delete().eq("id", enquiry.id);
      return { success: false, error: itemError.message };
    }

    return {
      success: true,
      request: printRequest,
      enquiry: enquiry,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user's printing requests
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, requests?: Array, error?: string}>}
 */
export async function getUserPrintingRequests(userId) {
  try {
    const { data, error } = await supabase
      .from("print_requests")
      .select(
        `
        *,
        print_request_replies(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, requests: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Add reply to print request (for customer chat)
 * @param {string} requestId - Print request ID
 * @param {string} message - Reply message
 * @param {boolean} isAdmin - Whether reply is from admin
 * @returns {Promise<{success: boolean, reply?: object, error?: string}>}
 */
export async function addPrintRequestReply(
  requestId,
  message,
  isAdmin = false
) {
  try {
    const { data, error } = await supabase
      .from("print_request_replies")
      .insert([
        {
          print_request_id: requestId,
          message: message,
          is_admin: isAdmin,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, reply: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user profile information from the users table
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, user: data };
}

// BANNERS
export async function getshipping() {
  const { data, error } = await supabase.from("shipping_banners").select();
  if (error) return { success: false, error: error.message };
  return { success: true, banners: data };
}

export async function getActiveShippingBanner() {
  const { data, error } = await supabase
    .from("shipping_banners")
    .select("*")
    .eq("active", true)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error here
    return { success: false, error: error.message };
  }

  return { success: true, banner: data };
}

export async function getshippingBanner() {
  const { data, error } = await supabase
    .from("shipping_banners")
    .select()
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, banners: data };
}

// Helper to upload an image to the shipping_banners bucket
async function uploadShippingBannerImage(imageFile) {
  if (!imageFile || !(imageFile instanceof File)) {
    return { url: null, error: null };
  }
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `shipping_${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from("shippingbanners")
    .upload(fileName, imageFile);
  if (uploadError) {
    return { url: null, error: uploadError.message };
  }
  const { data: urlData } = supabaseAdmin.storage
    .from("shippingbanners")
    .getPublicUrl(fileName);
  return { url: urlData.publicUrl, error: null };
}

// Add a new shipping banner - only one image, no link field
export async function addShippingBanner(banner, imageFile) {
  // Deactivate all other banners if this one is active
  /* if (banner.active) {
    const { error: deactivateError } = await supabaseAdmin
      .from("shipping_banners")
      .update({ active: false })
      .neq('id', id);
    if (deactivateError)
      return { success: false, error: deactivateError.message };
  } */
  const { url, error } = await uploadShippingBannerImage(imageFile);
  if (error) return { success: false, error };

  const bannerToInsert = { ...banner, image_url: url };
  const { data, error: insertError } = await supabaseAdmin
    .from("shipping_banners")
    .insert([bannerToInsert])
    .select();
  if (insertError)
    return { success: false, error: insertError.message };
  return { success: true, banner: data };
}

// Update a shipping banner - only one image, no link field
export async function updateShippingBanner(id, banner, imageFile) {
  // Deactivate all other banners if this one is being set to active
  if (banner.active) {
    const { error: deactivateError } = await supabaseAdmin
      .from("shipping_banners")
      .update({ active: false })
      .neq('id', id);
    if (deactivateError)
      return { success: false, error: deactivateError.message };
  }

  let imageUrl = banner.image_url;
  if (imageFile) {
    const { url, error } = await uploadShippingBannerImage(imageFile);
    if (error) return { success: false, error };
    imageUrl = url;
  }

  const { data, error } = await supabaseAdmin
    .from("shipping_banners")
    .update({ ...banner, image_url: imageUrl, updated_at: new Date() })
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, banner: data };
}

// Delete a shipping banner (no change)
export async function deleteShippingBanner(id) {
  const { error } = await supabaseAdmin
    .from("shipping_banners")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Toggle banner status - no link, only one active at a time
export async function toggleShippingBannerStatus(id, active) {
  try {
    if (active) {
      const { error: deactivateError } = await supabaseAdmin
        .from("shipping_banners")
        .update({ active: false })
        .neq("id", id);
      if (deactivateError) {
        return {
          success: false,
          error: `Failed to deactivate other banners: ${deactivateError.message}`,
        };
      }
    }
    const { error } = await supabaseAdmin
      .from("shipping_banners")
      .update({ active })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllBanners() {
  const { data, error } = await supabase.from("banners").select();
  if (error) return { success: false, error: error.message };
  return { success: true, banners: data };
}

export async function addBanner(banner, imageFile) {
  let imageUrl = banner.image;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, imageFile);
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("banners")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const bannerToInsert = { ...banner, image: imageUrl };
  const { data, error } = await supabase
    .from("banners")
    .insert([bannerToInsert])
    .select()
    .single();
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, banner: data };
}

export async function updateBanner(id, banner, imageFile) {
  let imageUrl = banner.image;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, imageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("banners")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("banners")
    .update({ ...banner, image: imageUrl })
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, banner: data };
}

export async function deleteBanner(id) {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleBannerStatus(id, active) {
  const { error } = await supabase
    .from("banners")
    .update({ active })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// CATEGORIES
export async function getAllCategories() {
  const { data, error } = await supabase.from("categories").select();
  if (error) return { success: false, error: error.message };
  return { success: true, categories: data };
}

export async function getActiveCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select()
    .eq("active", true); // no ordering
  if (error) return { success: false, error: error.message };
  return { success: true, categories: data };
}


export async function addCategory(category) {
  const { data, error } = await supabase
    .from("categories")
    .insert([category])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, category: data };
}

export async function getCategoryById(id) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { success: true, category: data };
  } catch (error) {
    console.error("Error fetching category:", error.message);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id, category) {
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, category: data };
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// SUBCATEGORIES
export async function getAllSubcategories() {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*, categories(id, name)")
    .order("sort_order", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, subcategories: data };
}

export async function getSubcategoriesByCategory(categoryId) {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, subcategories: data };
}

export async function addSubcategory(subcategory) {
  const { data, error } = await supabase
    .from("subcategories")
    .insert([subcategory])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, subcategory: data };
}

export async function updateSubcategory(id, subcategory) {
  const { data, error } = await supabase
    .from("subcategories")
    .update(subcategory)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, subcategory: data };
}

export async function deleteSubcategory(id) {
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// GROUPS
export async function getAllGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*, subcategories(id, name, categories(id, name))")
    .order("sort_order", { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, groups: data };
}

// PRODUCTS
/* getNearbyProducts(user_lat, user_lon) */
export async function getNearbyProducts(user_lat, user_lon) {
  const { data, error } = await supabase.rpc("get_products_within_15km", {
    user_lat,
    user_lon,
  });

  if (error) return { success: false, error: error.message };

  // Optionally: filter out products with inactive categories
  const filtered = (data || []).filter((product) => {
    return product.active !== false;
  });

  return { success: true, products: filtered };
}

// Fetch all products from Supabase
export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *, 
      groups(id, name, subcategories(id, name, categories(id, name, active))),
      subcategories(id, name, categories(id, name, active))
    `
    )
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  // Filter out products whose category is not active
  const filtered = (data || []).filter((product) => {
    // If product has subcategories, check category active
    if (product.subcategories && product.subcategories.categories) {
      return product.subcategories.categories.active !== false;
    }
    // If product has groups, check subcategory's category active
    if (
      product.groups &&
      product.groups.subcategories &&
      product.groups.subcategories.categories
    ) {
      return product.groups.subcategories.categories.active !== false;
    }
    return true;
  });
  return { success: true, products: filtered };
}

// Fetch products by subcategory from Supabase
export async function gettingProductsBySubcategoryName(subcategoryName) {
  // Step 1: Get subcategory ID by name (case-insensitive)
  const { data: subcats, error: subcatError } = await supabase
    .from("subcategories")
    .select("id")
    .ilike("name", subcategoryName)
    .limit(1);

  if (subcatError) return { success: false, error: subcatError.message };
  if (!subcats || subcats.length === 0) return { success: true, products: [] };

  const subcategoryId = subcats[0].id;

  // Step 2: Fetch products by subcategory ID
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      subcategories(id, name, categories(id, name, active))
    `)
    .eq("subcategory_id", subcategoryId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  // Filter out products where category is inactive
  const filtered = (data || []).filter((product) => {
    if (product.subcategories && product.subcategories.categories) {
      return product.subcategories.categories.active !== false;
    }
    return true;
  });

  return { success: true, products: filtered };
}

// Fetch products by subcategory name from Supabase
export async function getProductsBySubcategoryName(subcategoryName, lat, lon) {
  const { data, error } = await supabase.rpc(
    "get_products_by_subcategory_within_15km",
    {
      subcategory_name: subcategoryName,
      user_lat: lat,
      user_lon: lon,
    }
  );

  if (error) {
    console.error("Error fetching products by subcategory:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, products: data || [] };
}

// Fetch products by category from Supabase (using subcategories)
export async function getProductsByCategory(categoryId) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *, 
      subcategories(id, name, categories(id, name, active))
    `
    )
    .eq("subcategories.category_id", categoryId)
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  const filtered = (data || []).filter((product) => {
    if (product.subcategories && product.subcategories.categories) {
      return product.subcategories.categories.active !== false;
    }
    return true;
  });
  return { success: true, products: filtered };
}

export async function gettingProductsByCategoryName(categoryName) {
  // Step 1: Get category ID by name (case-insensitive)
  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", categoryName)
    .limit(1);

  if (categoryError) return { success: false, error: categoryError.message };
  if (!categories || categories.length === 0) return { success: true, products: [] };

  const categoryId = categories[0].id;

  // Step 2: Get all subcategories for that category
  const { data: subcats, error: subcatError } = await supabase
    .from("subcategories")
    .select("id")
    .eq("category_id", categoryId);

  if (subcatError) return { success: false, error: subcatError.message };

  const subcategoryIds = (subcats || []).map((s) => s.id);
  if (subcategoryIds.length === 0) return { success: true, products: [] };

  // Step 3: Fetch products with subcategory_id IN (subcategoryIds)
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      subcategories(id, name, categories(id, name, active))
    `)
    .in("subcategory_id", subcategoryIds)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  // Filter out inactive categories
  const filtered = (data || []).filter((product) => {
    if (product.subcategories && product.subcategories.categories) {
      return product.subcategories.categories.active !== false;
    }
    return true;
  });

  return { success: true, products: filtered };
}

// Fetch products by category name from Supabase (using subcategories)
export async function getProductsByCategoryName(categoryName, lat, lon) {
  const { data, error } = await supabase.rpc(
    "get_products_by_category_within_15km",
    {
      category_name: categoryName,
      user_lat: lat,
      user_lon: lon,
    }
  );

  if (error) {
    console.error("Error fetching products by category:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, products: data || [] };
}

export async function gettingProductsByGroupName(groupName) {
  // Step 1: Get group ID by name (case-insensitive)
  const { data: groups, error: groupError } = await supabase
    .from("groups")
    .select("id")
    .ilike("name", groupName)
    .limit(1);

  if (groupError) return { success: false, error: groupError.message };
  if (!groups || groups.length === 0) return { success: true, products: [] };

  const groupId = groups[0].id;

  // Step 2: Fetch products by group_id
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      groups(id, name)
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  return { success: true, products: data || [] };
}
// Fetch products by group name from Supabase
export async function getProductsByGroupName(groupName, lat, lon) {
  const { data, error } = await supabase.rpc(
    "get_products_by_group_within_15km",
    {
      group_name: groupName,
      user_lat: lat,
      user_lon: lon,
    }
  );

  if (error) {
    console.error("Error fetching products by group:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, products: data || [] };
}

/* Add Products to Supabase */
export async function addProduct(product, imageFile) {
  let imageUrl = product.image;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, image: imageUrl }])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, product: data };
}

/* Update Product in Supabase */
export async function updateProduct(id, product, imageFile) {
  let imageUrl = product.image;
  if (imageFile && imageFile instanceof File) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile);
    if (uploadError) return { success: false, error: uploadError.message };
    const { data: urlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("products")
    .update({ ...product, image: imageUrl })
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, product: data };
}

/* Delete Product In Supabase */
export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// USERS
export async function getAllUsers() {
  const { data, error } = await supabase.from("users").select();
  if (error) return { success: false, error: error.message };
  return { success: true, users: data };
}

import { v4 as uuidv4 } from "uuid";

export async function addUser(userProfile) {
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .insert([userProfile])
    .select()
    .single();
  if (dbError) {
    return { success: false, error: dbError.message };
  }
  return { success: true, user: dbUser };
}

export async function updateUser(id, user) {
  const { data, error } = await supabase
    .from("users")
    .update(user)
    .eq("id", id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, user: data };
}

export async function deleteUser(id) {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// --- CART MANAGEMENT ---

export async function addToCart(user_id, product_id, quantity = 1) {
  // Upsert: if item exists, update quantity; else insert
  const { data: existing, error: findError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .maybeSingle(); // Use maybeSingle to avoid 406 if not found
  if (findError && findError.code !== "PGRST116")
    return { success: false, error: findError.message };
  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, cartItem: data };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("cart_items")
      .insert([{ user_id, product_id, quantity }])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, cartItem: data };
  }
}

export const getCartItems = async (user_id) => {
  try {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/cart/${user_id}`);
    return { success: true, cartItems: res.data.cartItems };
  } catch (err) {
    console.error("Error fetching cart items:", err);
    return { success: false, cartItems: [], error: err };
  }
};

export const updateCartItem = async (cart_item_id, quantity) => {
  try {
    const res = await axios.put(`https://ecommerce-8342.onrender.com/api/cart/update/${cart_item_id}`, { quantity });
    return { success: true, updated: res.data };
  } catch (err) {
    console.error("Error updating cart item:", err);
    return { success: false, error: err };
  }
};

export const removeCartItem = async (cart_item_id) => {
  try {
    const res = await axios.delete(`https://ecommerce-8342.onrender.com/api/cart/remove/${cart_item_id}`);
    return { success: true, removed: res.data };
  } catch (err) {
    console.error("Error removing cart item:", err);
    return { success: false, error: err };
  }
};

export const clearCart = async (user_id) => {
  try {
    const res = await axios.delete(`https://ecommerce-8342.onrender.com/api/cart/clear/${user_id}`);
    return { success: true, cleared: res.data };
  } catch (err) {
    console.error("Error clearing cart:", err);
    return { success: false, error: err };
  }
};

// --- WISHLIST MANAGEMENT ---
export async function getWishlistItems(user_id) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, product_id, added_at, products(*)")
    .eq("user_id", user_id);
  if (error) return { success: false, error: error.message };
  // Flatten product data for easier use
  const wishlistItems = (data || []).map((item) => ({
    ...item.products,
    wishlist_item_id: item.id,
    added_at: item.added_at,
  }));
  return { success: true, wishlistItems };
}

export async function addToWishlist(user_id, product_id) {
  // Upsert: if item exists, do nothing; else insert
  const { data: existing, error: findError } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .single();
  if (findError && findError.code !== "PGRST116")
    return { success: false, error: findError.message };
  if (existing) {
    // Already exists, do nothing
    return { success: true, wishlistItem: existing };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("wishlist_items")
      .insert([{ user_id, product_id }])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, wishlistItem: data };
  }
}

export async function removeFromWishlist(wishlist_item_id) {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", wishlist_item_id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* export async function clearCart(user_id) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user_id);
  if (error) return { success: false, error: error.message };
  return { success: true };
} */

// --- ORDER MANAGEMENT ---
const BASE_URL = 'https://ecommerce-8342.onrender.com/api/order';
// ORDERS
export async function getAllOrders() {
  try {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/order/all`);
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// 2. Update Order Status (Admin)
export async function updateOrderStatus(id, status, adminNotes = "") {
  try {
    const res = await axios.put(`https://ecommerce-8342.onrender.com/api/order/status/${id}`, {
      status,
      adminnotes: adminNotes,
    });
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// 3. Place Order (Flat address)
export async function placeOrder(
  user_id,
  items,
  subtotal,
  shipping,
  total,
  address,
  payment_method
) {
  try {
    const res = await axios.post(`https://ecommerce-8342.onrender.com/api/order/place`, {
      user_id,
      items,
      subtotal,
      shipping,
      total,
      address,
      payment_method,
    });
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// 4. Place Order with Detailed Address
export async function placeOrderWithDetailedAddress(
  user_id,
  items,
  subtotal,
  shipping,
  total,
  detailedAddress,
  payment_method,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  gpsLocation // 👈 1. Add the new parameter here
) {
  try {
    const res = await axios.post(
      `https://ecommerce-8342.onrender.com/api/order/place-detailed`, // Ensure this URL is correct
      {
        user_id,
        items,
        subtotal,
        shipping,
        total,
        detailedAddress,
        payment_method,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        gpsLocation, // 👈 2. Add the data to the request body
      }
    );
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

// 5. Get Orders for a User
export async function getUserOrders(user_id) {
  try {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/order/user/${user_id}`);
    return res.data;
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function getOrderItemsByOrderId(order_id) {
  try {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/orderItems/${order_id}`)
    return res.data
  }
  catch (error) {
    return { success: false, error: error.message };
  }
}


// --- ENQUIRY MANAGEMENT ---
export async function createEnquiry({
  user_id,
  name,
  email,
  phone,
  message,
  cartItems,
}) {
  // 1. Insert enquiry
  const { data: enquiry, error: enquiryError } = await supabase
    .from("enquiries")
    .insert([{ user_id, name, email, phone, message }])
    .select()
    .single();
  if (enquiryError) return { success: false, error: enquiryError.message };
  // 2. Insert enquiry items
  const itemsToInsert = cartItems.map((item) => ({
    enquiry_id: enquiry.id,
    product_id: item.id || item.product_id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
    customization: item.customization || null,
  }));
  const { error: itemsError } = await supabase
    .from("enquiry_items")
    .insert(itemsToInsert);
  if (itemsError) return { success: false, error: itemsError.message };
  return { success: true, enquiry };
}

export async function getAllEnquiries() {
  // Fetch all enquiries with user info and items
  const { data, error } = await supabase
    .from("enquiries")
    .select("*, users(*), enquiry_items(*, products(*))")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, enquiries: data };
}

// --- USER ENQUIRY HISTORY FUNCTIONS ---

export async function getUserEnquiries(userId) {
  // Fetch user's enquiries with items and replies count
  const { data, error } = await supabase
    .from("enquiries")
    .select(
      `
      *,
      enquiry_items(*, products(*)),
      enquiry_replies(id, is_admin, message, created_at)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  // Calculate reply counts for each enquiry
  const enquiriesWithStats = data.map((enquiry) => ({
    ...enquiry,
    replyCount: enquiry.enquiry_replies ? enquiry.enquiry_replies.length : 0,
  }));

  return { success: true, enquiries: enquiriesWithStats };
}

export async function getEnquiryWithReplies(enquiryId) {
  // Fetch specific enquiry with all replies
  const { data, error } = await supabase
    .from("enquiries")
    .select(
      `
      *,
      enquiry_items(*, products(*)),
      enquiry_replies(*)
    `
    )
    .eq("id", enquiryId)
    .single();

  if (error) return { success: false, error: error.message };

  // Sort replies by created_at
  if (data.enquiry_replies) {
    data.enquiry_replies.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }

  return { success: true, enquiry: data };
}

export async function addEnquiryReply(
  enquiryId,
  message,
  isAdmin = false,
  adminId = null
) {
  // Add a new reply to an enquiry
  const { data, error } = await supabase
    .from("enquiry_replies")
    .insert([
      {
        enquiry_id: enquiryId,
        message: message,
        is_admin: isAdmin,
        admin_id: adminId,
      },
    ])
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Update enquiry status if user is replying
  if (!isAdmin) {
    await supabase
      .from("enquiries")
      .update({ status: "pending" })
      .eq("id", enquiryId);
  }

  return { success: true, reply: data };
}

export async function updateEnquiryStatus(enquiryId, status) {
  // Update enquiry status
  const { data, error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", enquiryId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, enquiry: data };
}

export async function getUnreadEnquiryCount(userId) {
  // Get count of enquiries with unread admin replies (status = 'replied' and admin_reply = true)
  const { data, error } = await supabase
    .from("enquiries")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "replied")
    .eq("admin_reply", true);

  if (error) return { success: false, error: error.message };

  return { success: true, count: data.length };
}

export async function markEnquiriesAsRead(userId) {
  // Mark all 'replied' enquiries as 'resolved' to indicate user has seen the replies
  const { error } = await supabase
    .from("enquiries")
    .update({ status: "resolved" })
    .eq("user_id", userId)
    .eq("status", "replied");

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// WEBSITE SETTINGS
/**
 * Uploads an image for website settings (logo, banners, etc.)
 * @param {File} imageFile - Image file to upload
 * @param {string} folder - Folder name in storage
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadWebsiteImage(imageFile, folder = "website") {
  if (!imageFile || !(imageFile instanceof File)) {
    return { success: false, error: "Invalid image file" };
  }

  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(fileName, imageFile);

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("uploads")
    .getPublicUrl(fileName);

  return { success: true, url: urlData.publicUrl };
}

// PROMOTIONAL SETTINGS - Focused on marketing/promotional content
/**
 * Fetches all active promotional settings
 * @returns {Promise<{success: boolean, settings?: object, error?: string}>}
 */
export async function getPromotionalSettings() {
  const { data, error } = await supabase
    .from("promotional_settings")
    .select("*")
    .eq("is_active", true);

  if (error) return { success: false, error: error.message };

  // Convert array to key-value object for easier access
  const settings = {};
  data.forEach((setting) => {
    settings[setting.setting_key] = setting.setting_value;
  });

  return { success: true, settings };
}

/**
 * Updates a single promotional setting
 * @param {string} key - Setting key
 * @param {any} value - New value
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updatePromotionalSetting(key, value) {
  const { error } = await supabase.from("promotional_settings").upsert({
    setting_key: key,
    setting_value: value,
    updated_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Updates multiple promotional settings at once
 * @param {Object} settings - Object with key-value pairs
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateMultiplePromotionalSettings(settings) {
  const updates = Object.entries(settings).map(([key, value]) => ({
    setting_key: key,
    setting_value: value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("promotional_settings").upsert(updates);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// USER PROFILE WITH DETAILED ADDRESS MANAGEMENT

/**
 * Update user profile with detailed address fields
 * @param {string} userId - The user ID
 * @param {Object} profileData - User profile data including detailed address fields
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function updateUserProfileWithAddress(userId, profileData) {
  const {
    houseNumber,
    streetAddress,
    suiteUnitFloor,
    locality,
    area,
    city,
    state,
    postalCode,
    country,
    landmark,
    ...otherFields
  } = profileData;

  const updateData = {
    ...otherFields,
    house_number: houseNumber || null,
    street_address: streetAddress || null,
    suite_unit_floor: suiteUnitFloor || null,
    locality: locality || null,
    area: area || null,
    city: city || null,
    state: state || null,
    postal_code: postalCode || null,
    country: country || "India",
    landmark: landmark || null,
  };

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Construct full address in JavaScript
  const addressParts = [
    data.house_number,
    data.street_address,
    data.suite_unit_floor,
    data.locality,
    data.area,
    data.city,
    data.state,
    data.postal_code,
    data.country,
    data.landmark,
  ].filter((part) => part && part.trim() !== "");

  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "";

  // Transform database fields to frontend-friendly names
  const transformedUser = {
    ...data,
    houseNumber: data.house_number,
    streetAddress: data.street_address,
    suiteUnitFloor: data.suite_unit_floor,
    postalCode: data.postal_code,
    fullAddress: fullAddress,
  };

  return { success: true, user: transformedUser };
}

export async function getUserProfileWithAddress(userId) {
  // Fetch all relevant fields directly (no computed column)
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      house_number,
      street_address,
      suite_unit_floor,
      locality,
      area,
      city,
      state,
      postal_code,
      country,
      landmark
    `
    )
    .eq("id", userId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Construct formatted address in JS
  const addressParts = [
    data.house_number,
    data.street_address,
    data.suite_unit_floor,
    data.locality,
    data.area,
    data.city,
    data.state,
    data.postal_code,
    data.country,
    data.landmark,
  ].filter((part) => part && part.toString().trim() !== "");
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "";

  // Transform database fields to frontend-friendly names for easier handling
  const transformedUser = {
    ...data,
    houseNumber: data.house_number,
    streetAddress: data.street_address,
    suiteUnitFloor: data.suite_unit_floor,
    locality: data.locality,
    area: data.area,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    country: data.country,
    landmark: data.landmark,
    fullAddress,
  };

  return { success: true, user: transformedUser };
}

export async function createUserProfileWithAddress(userProfile) {
  // Extract detailed address fields
  const {
    houseNumber,
    streetAddress,
    suiteUnitFloor,
    locality,
    area,
    city,
    state,
    postalCode,
    country,
    landmark,
    gstin,
    ...otherFields
  } = userProfile;

  // Prepare the insert object with detailed address fields
  const insertData = {
    ...otherFields,
    house_number: houseNumber || null,
    street_address: streetAddress || null,
    suite_unit_floor: suiteUnitFloor || null,
    locality: locality || null,
    area: area || null,
    city: city || null,
    state: state || null,
    postal_code: postalCode || null,
    country: country || "India",
    landmark: landmark || null,
    gstin: gstin || null,
    created_at: new Date().toISOString(),
  };

  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .insert([insertData])
    .select("*")
    .single();

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  // Construct full address in JavaScript
  const addressParts = [
    dbUser.house_number,
    dbUser.street_address,
    dbUser.suite_unit_floor,
    dbUser.locality,
    dbUser.area,
    dbUser.city,
    dbUser.state,
    dbUser.postal_code,
    dbUser.country,
    dbUser.landmark,
  ].filter((part) => part && part.trim() !== "");

  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "";

  // Transform database fields to frontend-friendly names
  const transformedUser = {
    ...dbUser,
    houseNumber: dbUser.house_number,
    streetAddress: dbUser.street_address,
    suiteUnitFloor: dbUser.suite_unit_floor,
    locality: dbUser.locality,
    area: dbUser.area,
    city: dbUser.city,
    state: dbUser.state,
    postalCode: dbUser.postal_code,
    country: dbUser.country,
    landmark: dbUser.landmark,
    gstin: dbUser.gstin,
    fullAddress: fullAddress,
  };

  return { success: true, user: transformedUser };
}

/**
 * Search users by postal code (for delivery area checking, etc.)
 * @param {string} postalCode - The postal code to search for
 * @returns {Promise<{success: boolean, users?: array, error?: string}>}
 */

/**
 * Search users by city and state
 * @param {string} city - The city to search for
 * @param {string} state - The state to search for
 * @returns {Promise<{success: boolean, users?: array, error?: string}>}
 */
export async function getUsersByLocation(city, state) {
  let query = supabase
    .from("users")
    .select("id, name, email, city, state, postal_code");

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }
  if (state) {
    query = query.ilike("state", `%${state}%`);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };
  return { success: true, users: data };
}

// USER ADDRESSES
/* Get Default Address */
export async function getDefaultUserAddress(userId) {
  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();

  if (error) {
    console.error("Failed to get default address:", error.message);
    return null;
  }

  return data;
}

/**
 * Get all addresses for a user
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, addresses?: Array, error?: string}>}
 */
export async function getUserAddresses(userId) {
  const { data, error } = await supabase
    .from("user_addresses")
    .select()
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, addresses: data };
}

/**
 * Get a user's default shipping address
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, address?: Object, error?: string}>}
 */
/* export async function getDefaultUserAddress(userId) {
  const { data, error } = await supabase
    .from("user_addresses")
    .select()
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No default address found, try to get any address
      const { data: anyAddress, error: anyError } = await supabase
        .from("user_addresses")
        .select()
        .eq("user_id", userId)
        .limit(1)
        .single();
      
      if (anyError) {
        return { success: false, error: "No address found" };
      }
      
      return { success: true, address: anyAddress };
    }
    return { success: false, error: error.message };
  }
  
  return { success: true, address: data };
} */

/**
 * Add a new address for a user
 * @param {string} userId - The user ID
 * @param {Object} address - The address data
 * @returns {Promise<{success: boolean, address?: Object, error?: string}>}
 */
import axios from "axios";

export async function addUserAddress(userId, address) {
  try {
    const response = await axios.post(
      "https://ecommerce-8342.onrender.com/api/geo-address/createAddress",
      {
        ...address,
        user_id: userId,
      }
    );

    return {
      success: true,
      address: response.data.data, // your backend returns it in .data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Something went wrong",
    };
  }
}

/**
 * Update an existing address
 * @param {string} addressId - The address ID
 * @param {Object} address - The updated address data
 * @returns {Promise<{success: boolean, address?: Object, error?: string}>}
 */

export async function updateUserAddress(addressId, address) {
  try {
    const res = await axios.put(
      `https://ecommerce-8342.onrender.com/api/geo-address/update/${addressId}`,
      address
    );

    return {
      success: true,
      address: res.data.data,
    };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Failed to update address",
    };
  }
}

/**
 * Delete a user address
 * @param {string} addressId - The address ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */

export async function deleteUserAddress(addressId) {
  try {
    await axios.delete(
      `https://ecommerce-8342.onrender.com/api/geo-address/delete/${addressId}`
    );

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Failed to delete address",
    };
  }
}

/**
 * Set an address as the default address
 * @param {string} userId - The user ID
 * @param {string} addressId - The address ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function setAddressAsDefault(userId, addressId) {
  const { error } = await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Migrate a user's address from the users table to the user_addresses table
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function migrateUserAddresses(userId) {
  try {
    // Get user details from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      return { success: false, error: userError.message };
    }

    // Check if user has address information
    if (
      !userData.street_address ||
      !userData.city ||
      !userData.state ||
      !userData.country
    ) {
      return { success: false, error: "No address information to migrate" };
    }

    // Check if user already has addresses in user_addresses table
    const { data: existingAddresses, error: addressError } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId);

    if (addressError) {
      return { success: false, error: addressError.message };
    }

    if (existingAddresses && existingAddresses.length > 0) {
      return { success: false, error: "User already has migrated addresses" };
    }

    // Create a new address entry from user profile data
    const addressData = {
      user_id: userId,
      address_name: "Primary Address",
      is_default: true,
      street_address: userData.street_address,
      suite_unit_floor: userData.suite_unit_floor,
      house_number: userData.house_number,
      locality: userData.locality,
      area: userData.area,
      city: userData.city,
      state: userData.state,
      postal_code: userData.postal_code,
      country: userData.country,
      landmark: userData.landmark,
    };

    const { error: insertError } = await supabase
      .from("user_addresses")
      .insert([addressData]);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const API_BASE = "https://ecommerce-8342.onrender.com/api"; 

export async function fetchStores() {
  const res = await fetch(`${API_BASE}/stores/fetch`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.stores;
}

export async function addStore(formData) {
  const res = await fetch(`${API_BASE}/stores/add`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.store;
}

export async function updateStore(id, formData) {
  const res = await fetch(`${API_BASE}/stores/update/${id}`, {
    method: "PUT",
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.store;
}

export async function deleteStore(id) {
  const res = await fetch(`${API_BASE}/stores/delete/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return true;
}

// The API endpoint is set to your quick-pick service
const API_URL = "https://ecommerce-8342.onrender.com/api/quick-pick";

// Fetch all quick picks
export async function fetchQuickPicks() {
  // axios automatically throws an error for non-2xx responses
  const response = await axios.get(`${API_URL}/list`);
  // aaxios wraps the JSON response in a 'data' property
  return response.data.quickPicks;
}

// NEW: Fetches all groups for a specific Quick Pick ID
export async function fetchGroupsForQuickPick(quickPickId) {
  // This assumes your API route is /api/quick-pick-groups/by-quick-pick/:quickPickId
  const response = await fetch(`https://ecommerce-8342.onrender.com/api/quick-pick-group/by-quick-pick/${quickPickId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch quick pick groups");
  }
  const data = await response.json();
  return data.quickPickGroups;
}

// NEW: Fetches all products for a specific Quick Pick Group ID
export async function fetchProductsForGroup(groupId) {
  // This assumes your API route is /api/quick-pick-group-products/products-for-group/:quick_pick_group_id
  const response = await fetch(`https://ecommerce-8342.onrender.com/api/quick-pick-group-product/getProductsByGroup/${groupId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  // The data is nested, so we extract the product details
  return data.map(item => item.products);
}

// Add new quick pick
export async function addQuickPick(formData) {
  const response = await axios.post(`${API_URL}/add`, formData, {
    // This header is important for file uploads
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.quickPick;
}

// Edit an existing quick pick
export async function editQuickPick(id, formData) {
  const response = await axios.put(`${API_URL}/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.quickPick;
}

// Delete a quick pick
export async function deleteQuickPick(id) {
  await axios.delete(`${API_URL}/delete/${id}`);
  // Return true to indicate success, matching the previous function's behavior
  return true;
}

// The API endpoints are set for your Saving Zone services
const API_SZ_URL = "https://ecommerce-8342.onrender.com/api/saving-zone";
const SZ_GROUP_API_URL = "https://ecommerce-8342.onrender.com/api/saving-zone-group";
const SZ_PRODUCT_API_URL = "https://ecommerce-8342.onrender.com/api/saving-zone-group-product";

// Corresponds to: fetchQuickPicks
// Fetches all Saving Zones
export async function getAllSavingZones() {
  const response = await axios.get(`${API_SZ_URL}/list`);
  return response.data.savingZones;
}

// Corresponds to: fetchGroupsForQuickPick
// Fetches all groups for a specific Saving Zone ID
export async function getGroupsBySavingZoneId(savingZoneId) {
  const response = await fetch(`https://ecommerce-8342.onrender.com/api/saving-zone-group/getGroupsBySavingZoneId/${savingZoneId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch saving zone groups");
  }
  const data = await response.json();
  return data.savingZoneGroups;
}

// Corresponds to: fetchProductsForGroup
// Fetches all products for a specific Saving Zone Group ID
export async function getProductsForSavingZoneGroup(groupId) {
  const response = await fetch(`${SZ_PRODUCT_API_URL}/getProductsByGroup/${groupId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  // The data is nested, so we extract the product details
  return data.map(item => item.products);
}

// Corresponds to: addQuickPick
// Add a new Saving Zone
export async function addSavingZone(formData) {
  const response = await axios.post(`${API_SZ_URL}/add`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.savingZone;
}

// Corresponds to: editQuickPick
// Edit an existing Saving Zone
export async function updateSavingZone(id, formData) {
  const response = await axios.put(`${API_SZ_URL}/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.savingZone;
}

// Corresponds to: deleteQuickPick
// Delete a Saving Zone
export async function deleteSavingZone(id) {
  await axios.delete(`${API_SZ_URL}/delete/${id}`);
  return true; // Return true to indicate success
}

// The base URL for your recommended stores API
const API_URL_New = "https://ecommerce-8342.onrender.com/api/recommended-stores";

/**
 * Fetches all recommended stores.
 * @returns {Promise<Array>} A promise that resolves to an array of store objects.
 */
export async function fetchRecommendedStores() {
  const response = await axios.get(`${API_URL_New}/list`);
  return response.data.recommendedStores;
}

/**
 * Fetches a single recommended store by its ID.
 * @param {string|number} id - The ID of the store to fetch.
 * @returns {Promise<Object>} A promise that resolves to a single store object.
 */
export async function fetchSingleRecommendedStore(id) {
  const response = await axios.get(`${API_URL_New}/${id}`);
  return response.data.recommendedStore;
}

/**
 * Adds a new recommended store.
 * @param {FormData} formData - The form data containing the store's name and image file.
 * The image file must be appended with the key 'image_url'.
 * e.g., formData.append('image_url', file);
 * @returns {Promise<Object>} A promise that resolves to the newly created store object.
 */
export async function addRecommendedStore(formData) {
  const response = await axios.post(`${API_URL_New}/add`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.recommendedStore;
}

/**
 * Edits an existing recommended store.
 * @param {string|number} id - The ID of the store to update.
 * @param {FormData} formData - The form data containing the updated name and/or image file.
 * NOTE: Your backend route expects the image file with the key 'image'.
 * e.g., formData.append('image', file);
 * @returns {Promise<Object>} A promise that resolves to the updated store object.
 */
export async function editRecommendedStore(id, formData) {
  const response = await axios.put(`${API_URL_New}/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.recommendedStore;
}

/**
 * Deletes a recommended store by its ID.
 * @param {string|number} id - The ID of the store to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion is successful.
 */
export async function deleteRecommendedStore(id) {
  await axios.delete(`${API_URL_New}/delete/${id}`);
  return true;
}

// --- B&B Section Functions ---

// 1. Fetches all main B&B items
export async function fetchBandBs() {
    const response = await fetch(`https://ecommerce-8342.onrender.com/api/bnb/list`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch B&B items');
    }
    const data = await response.json();
    return data.bandbs; // Corresponds to the key in your b&bController.js
}

// 2. Fetches all groups for a specific B&B ID
export async function fetchGroupsForBandB(bnbId) {
    const response = await fetch(`https://ecommerce-8342.onrender.com/api/b&b-group/by-bnb/${bnbId}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch B&B groups');
    }
    const data = await response.json();
    return data.bandbGroups; // Corresponds to the key in your b&bGroupController.js
}

// 3. Fetches all products for a specific B&B Group ID
export async function fetchProductsForBandBGroup(groupId) {
    const response = await fetch(`https://ecommerce-8342.onrender.com/api/b&b-group-product/getProductsByGroup/${groupId}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch B&B products');
    }
    const data = await response.json();
    // The data is nested, so we extract the product details
    return data.map(item => item.products).filter(p => p);
}


export const getYouMayLikeProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("you_may_like")
      .select(`
        product_id,
        products:product_id (id, name, price, old_price, rating, uom, discount, image, category)
      `);

    if (error) throw error;

    const products = data.map((item) => ({
      id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      old_price: item.products.old_price,
      rating: item.products.rating,
      image: item.products.image,
      category: item.products.category,
    }));

    return { success: true, products };
  } catch (err) {
    console.error("Error fetching You May Like products:", err.message);
    return { success: false, error: err.message };
  }
};

export async function getProductsForRecommendedStore(storeId) {
  // Use the storeId to construct the URL for the API endpoint.
  // This assumes your API is hosted at a similar base URL.
  const response = await fetch(`https://ecommerce-8342.onrender.com/api/product-recommended-stores/${storeId}`);
  
  // Check if the network request was successful.
  if (!response.ok) {
    // If not, parse the error message from the server and throw a new error.
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch recommended products.');
  }

  // If the request was successful, parse the JSON data.
  const data = await response.json();
  
  // The API response from the server-side code contains a nested structure.
  // We need to map over the array to get the `products` object from each item.
  // The filter() part removes any potential null or undefined products.
  return data.map(item => item.products).filter(p => p);
}


export async function getProductsForBrand(brandId) {
  try {
    const response = await fetch(
      `https://ecommerce-8342.onrender.com/api/product-brand/${brandId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch products for brand.");
    }

    const data = await response.json();

    // The backend controller already returns just products[]
    return data.map(item => item.products).filter(p => p);
  } catch (err) {
    console.error("Error in getProductsForBrand:", err.message);
    throw err;
  }
}

// --- Banner Section Functions ---

// 1. Fetches all Banners filtered by a specific type (e.g., 'Deals', 'Offer')
// This uses the /api/banner/type/:bannerType route we created earlier.
export async function fetchBannersByType(bannerType) {
    if (!bannerType) {
        throw new Error('Banner type is required.');
    }
    const response = await fetch(`https://ecommerce-8342.onrender.com/api/banner/type/${bannerType}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to fetch banners for type: ${bannerType}`);
    }

    const data = await response.json();
    return data.banners; // Corresponds to the key in your addBannerController.js
}

// 2. Fetches all Banner Groups for a specific Banner ID
// This uses the /api/banner-groups/by-banner/:bannerId route from your groups controller.
export async function fetchGroupsForBanner(bannerId) {
    if (!bannerId) {
        throw new Error('Banner ID is required.');
    }
    const response = await fetch(`https://ecommerce-8342.onrender.com/api/banner-groups/by-banner/${bannerId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to fetch groups for Banner ID: ${bannerId}`);
    }

    const data = await response.json();
    return data.bannerGroups; // Corresponds to the key in your addBannerGroupController.js
}

// 3. Fetches all products for a specific Banner Group ID
// This uses the /api/banner-group-products/by-group/:add_banner_group_id route.
export async function fetchProductsForBannerGroup(groupId) {
    if (!groupId) {
        throw new Error('Group ID is required.');
    }
    const response = await fetch(`https://ecommerce-8342.onrender.com/api/banner-group-products/by-group/${groupId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to fetch products for Banner Group ID: ${groupId}`);
    }

    const data = await response.json();
    // The data is an array of {product_id, products: {...}} objects. We extract the product data.
    return data.map(item => item.products).filter(p => p);
}

// --- Banner Section Functions ---
// --- Unique Section APIs ---
// Base URL: adjust if you deploy
const BASE_URL2 = "https://ecommerce-8342.onrender.com";

// 1) Fetch all Unique Sections
// GET /api/unique-sections/list
export async function fetchUniqueSections() {
  const response = await fetch(`${BASE_URL2}/api/unique-sections/list`);

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || "Failed to fetch unique sections.");
  }

  const data = await response.json();
  // Controller returns: { success: true, uniqueSections: [...] }
  return data.uniqueSections || [];
}

// 2) Fetch a single Unique Section by ID
// GET /api/unique-sections/:id
export async function fetchUniqueSectionById(sectionId) {
  if (!sectionId) throw new Error("Section ID is required.");

  const response = await fetch(`${BASE_URL2}/api/unique-sections/${sectionId}`);

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || `Failed to fetch section ${sectionId}.`);
  }

  const data = await response.json();
  // Controller returns: { success: true, uniqueSection: {...} }
  return data.uniqueSection;
}

// 3) Fetch all products for a Unique Section
// GET /api/unique-sections-products/section/:unique_section_id
// Returns [{ product_id, products: { ... } }]
export async function fetchProductsForUniqueSection(sectionId) {
  if (!sectionId) throw new Error("Section ID is required.");

  const response = await fetch(
    `${BASE_URL2}/api/unique-sections-products/section/${sectionId}`
  );

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(
      error?.error || `Failed to fetch products for section ${sectionId}.`
    );
  }

  const data = await response.json();
  // Extract the denormalized product rows
  return (data || []).map((row) => row.products).filter(Boolean);
}

// 4) Fetch all Unique Sections that stock a specific product
// GET /api/unique-sections-products/product/:product_id
// Returns [{ unique_section_id, unique_section: {...} }]
export async function fetchUniqueSectionsForProduct(productId) {
  if (!productId) throw new Error("Product ID is required.");

  const response = await fetch(
    `${BASE_URL2}/api/unique-sections-products/product/${productId}`
  );

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(
      error?.error || `Failed to fetch sections for product ${productId}.`
    );
  }

  const data = await response.json();
  // Return the embedded sections array for convenience
  return (data || []).map((row) => row.unique_section).filter(Boolean);
}

// 5) Map a single product to a Unique Section
// POST /api/unique-sections-products/map
export async function mapProductToUniqueSectionApi({ product_id, unique_section_id }) {
  if (!product_id || !unique_section_id) {
    throw new Error("product_id and unique_section_id are required.");
  }

  const response = await fetch(`${BASE_URL2}/api/unique-sections-products/map`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id, unique_section_id }),
  });

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || "Failed to map product to section.");
  }

  return await response.json(); // { message: ... }
}

// 6) Remove a product from a Unique Section
// DELETE /api/unique-sections-products/remove  (expects JSON body)
export async function removeProductFromUniqueSectionApi({ product_id, unique_section_id }) {
  if (!product_id || !unique_section_id) {
    throw new Error("product_id and unique_section_id are required.");
  }

  const response = await fetch(`${BASE_URL2}/api/unique-sections-products/remove`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id, unique_section_id }),
  });

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || "Failed to remove product from section.");
  }

  return await response.json(); // { message: ... }
}

// 7) Bulk map products to a Unique Section by names
// POST /api/unique-sections-products/bulk-map-by-names
export async function bulkMapUniqueSectionByNamesApi({ section_name, product_names }) {
  if (!section_name || !Array.isArray(product_names)) {
    throw new Error("section_name and product_names[] are required.");
  }

  const response = await fetch(
    `${BASE_URL2}/api/unique-sections-products/bulk-map-by-names`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section_name, product_names }),
    }
  );

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || "Failed to bulk map products to section.");
  }

  return await response.json(); // { message, mapped_products }
}

// 8) Fetch Unique Sections by section_type (banner type)
// GET /api/unique-sections/list  + client-side filter
export async function fetchUniqueSectionsByType(sectionType) {
  const response = await fetch(`${BASE_URL2}/api/unique-sections/type/${sectionType}`);

  if (!response.ok) {
    const error = await safeJson(response);
    throw new Error(error?.error || `Failed to fetch sections of type ${sectionType}`);
  }

  const data = await response.json();
  return data.uniqueSections || [];
}


// --- helpers ---
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}


// ---SUB SECTIONS FUNCTIONS (SUBSTORES)----
// The server.js route for SubStores is mounted at "/api/sub-stores"
const SUBSTORE_API_PATH = "https://ecommerce-8342.onrender.com/api/sub-stores";


export async function fetchSubStores() {
  // Corresponds to router.get("/fetch", getAllSubStores);
  const res = await fetch(`${SUBSTORE_API_PATH}/fetch`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  // Assuming the backend returns 'stores' key (as per your SubStoreAdmin component)
  return data.stores; 
}

export async function addSubStore(formData) {
  // Corresponds to router.post("/add", upload.single("image"), addSubStore);
  const res = await fetch(`${SUBSTORE_API_PATH}/add`, {
    method: "POST",
    body: formData, // FormData handles the 'multipart/form-data' header automatically
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  // Assuming the backend returns 'store' key
  return data.store; 
}

export async function updateSubStore(id, formData) {
  // Corresponds to router.put("/update/:id", upload.single("image"), updateSubStore);
  const res = await fetch(`${SUBSTORE_API_PATH}/update/${id}`, {
    method: "PUT",
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  // Assuming the backend returns 'store' key
  return data.store;
}

export async function deleteSubStore(id) {
  // Corresponds to router.delete("/delete/:id", deleteSubStore);
  const res = await fetch(`${SUBSTORE_API_PATH}/delete/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return true;
}

/* this is a testing commit */