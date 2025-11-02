// src/api/bannerApi.js
// API functions for banner-related operations

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://big-best-backend.vercel.app/api";

/**
 * Fetch all banners
 * @returns {Promise<{success: boolean, banners: Array}>}
 */
export async function getAllBanners() {
  try {
    const response = await fetch(`${API_BASE_URL}/banner/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all banners:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch banners by type (e.g., 'hero', 'homepage', 'promotional')
 * @param {string} bannerType - The type of banner to fetch
 * @returns {Promise<{success: boolean, banners: Array}>}
 */
export async function getBannersByType(bannerType) {
  try {
    const response = await fetch(`${API_BASE_URL}/banner/type/${bannerType}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching banners of type ${bannerType}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all banners from the admin panel (add_banner table)
 * @returns {Promise<{success: boolean, banners: Array}>}
 */
export async function getAllAdminBanners() {
  try {
    const response = await fetch(`${API_BASE_URL}/banner/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching admin banners:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch a single banner by ID
 * @param {string} bannerId - The ID of the banner
 * @returns {Promise<{success: boolean, banner: Object}>}
 */
export async function getBannerById(bannerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/banner/${bannerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching banner with ID ${bannerId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Add a new banner (admin only)
 * @param {FormData} formData - Form data containing banner details and image
 * @returns {Promise<{success: boolean, banner: Object}>}
 */
export async function addBanner(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/banner/add`, {
      method: "POST",
      body: formData, // FormData handles Content-Type automatically
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding banner:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing banner (admin only)
 * @param {string} bannerId - The ID of the banner to update
 * @param {FormData} formData - Form data containing updated banner details
 * @returns {Promise<{success: boolean, banner: Object}>}
 */
export async function updateBanner(bannerId, formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/banner/update/${bannerId}`, {
      method: "PUT",
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating banner ${bannerId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a banner (admin only)
 * @param {string} bannerId - The ID of the banner to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function deleteBanner(bannerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/banner/delete/${bannerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting banner ${bannerId}:`, error);
    return { success: false, error: error.message };
  }
}
