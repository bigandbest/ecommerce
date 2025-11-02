// src/api/userApi.js
import supabase from "../services/supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://big-best-backend.vercel.app/api";

// Get auth headers with token
const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };
};

// User Profile API
export const getUserProfile = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Error fetching user profile:", error.message);
    return {
      success: false,
      error: error.message,
      user: null,
    };
  }
};

// Upload Profile Image
export const uploadProfileImage = async (imageFile) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const formData = new FormData();
    formData.append("profileImage", imageFile);

    const response = await fetch(`${API_BASE_URL}/user/profile/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

// Delete Profile Image
export const deleteProfileImage = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/profile/delete-image`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw error;
  }
};

// Get User Orders
export const getUserOrders = async (limit = 10, offset = 0) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    console.log(
      "Making request to:",
      `${API_BASE_URL}/order/user/${session.user.id}?limit=${limit}&offset=${offset}`
    );

    const headers = await getAuthHeaders();
    console.log("Request headers:", headers);

    const response = await fetch(
      `${API_BASE_URL}/order/user/${session.user.id}?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers,
      }
    );

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error text:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Response data:", result);
    return result;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Update User Profile (for additional user data that might be stored in backend)
export const updateUserProfile = async (profileData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
