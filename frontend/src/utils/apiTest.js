// Test API connectivity
export const testAPIConnection = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/debug", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API Response Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("API Response Data:", data);
      return { success: true, data };
    } else {
      console.error("API Response failed:", response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error("API Connection failed:", error);
    return { success: false, error: error.message };
  }
};

// Test with auth token
export const testAPIWithAuth = async () => {
  try {
    // You can test this with a real token
    const testToken = "your-test-token-here";

    const response = await fetch(
      "http://localhost:8000/api/order/user/test-user-id",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
      }
    );

    console.log("Auth API Response Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Auth API Response Data:", data);
      return { success: true, data };
    } else {
      console.error("Auth API Response failed:", response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error("Auth API Connection failed:", error);
    return { success: false, error: error.message };
  }
};
