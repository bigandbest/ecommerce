const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://big-best-backend.vercel.app/api";

console.log("API_BASE_URL:", API_BASE_URL);

// Helper function to safely parse JSON
const safeJsonParse = async (response) => {
  try {
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON parse error:", error);
    return { success: false, error: "Invalid JSON response" };
  }
};

export const productService = {
  async getAllProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/productsroute/allproducts`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.success ? data.products : [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  async getAllCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/productsroute/categories`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.success ? data.categories : [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  async getAllSubcategories() {
    const response = await fetch(`${API_BASE_URL}/categories/subcategories`);
    const data = await response.json();
    return data.success ? data.subcategories : [];
  },

  async getSubcategoriesByCategory(categoryId) {
    const response = await fetch(
      `${API_BASE_URL}/categories/subcategories/category/${categoryId}`
    );
    const data = await response.json();
    return data.success ? data.subcategories : [];
  },

  async getAllGroups() {
    const response = await fetch(`${API_BASE_URL}/categories/groups`);
    const data = await response.json();
    return data.success ? data.groups : [];
  },

  async getGroupsBySubcategory(subcategoryId) {
    const response = await fetch(
      `${API_BASE_URL}/categories/groups/subcategory/${subcategoryId}`
    );
    const data = await response.json();
    return data.success ? data.groups : [];
  },

  async getSubcategoryDetails(subcategoryId) {
    const response = await fetch(
      `${API_BASE_URL}/categories/subcategory/${subcategoryId}`
    );
    const data = await response.json();
    return data.success ? data.subcategory : null;
  },

  async getCategoriesHierarchy() {
    const response = await fetch(`${API_BASE_URL}/categories/hierarchy`);
    const data = await response.json();
    return data.success ? data.categories : [];
  },

  async getProductsByCategory(category) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/productsroute/category/${category}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.success ? data.products : [];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  },

  async getQuickPicks(limit = 30, filter = null) {
    try {
      let url = `${API_BASE_URL}/productsroute/quick-picks?limit=${limit}`;
      if (filter) {
        url += `&filter=${encodeURIComponent(filter)}`;
      }
      console.log("Fetching from URL:", url);
      const response = await fetch(url);
      console.log("Response status:", response.status);
      if (!response.ok) return [];
      const data = await response.json();
      console.log("API response:", data);
      return data.success ? data.products : [];
    } catch (error) {
      console.error("Error fetching quick picks:", error);
      return [];
    }
  },

  async getProductsBySubcategory(subcategoryId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/productsroute/subcategory/${subcategoryId}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.success ? data.products : [];
    } catch (error) {
      console.error("Error fetching products by subcategory:", error);
      return [];
    }
  },

  async getProductsByGroup(groupId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/productsroute/group/${groupId}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.success ? data.products : [];
    } catch (error) {
      console.error("Error fetching products by group:", error);
      return [];
    }
  },
};
