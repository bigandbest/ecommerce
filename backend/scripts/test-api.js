import api from "../frontend/src/services/api.js";

async function testShopByStoresAPI() {
  try {
    console.log("Testing shop-by-stores API...");
    const response = await api.get("/shop-by-stores");
    console.log("Response:", response.data);
    console.log("Number of stores:", response.data.length);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testShopByStoresAPI();
