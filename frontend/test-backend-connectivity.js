#!/usr/bin/env node

// Simple script to test backend connectivity
import fetch from "node-fetch";

const API_BASE_URL = "http://localhost:8000/api";

async function testEndpoints() {
  const endpoints = [
    "/recommended-stores/list",
    "/daily-deals/list",
    "/promo-banner/all",
    "/product-variants/products-with-variants",
    "/productsroute/quick-picks?limit=20",
  ];

  console.log("🔍 Testing Backend Connectivity...\n");

  for (const endpoint of endpoints) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Testing: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const status = response.status;
      const statusText = response.statusText;

      if (status === 200) {
        console.log(`✅ ${endpoint} - OK (${status})`);
      } else {
        console.log(`❌ ${endpoint} - ${status} ${statusText}`);
      }
    } catch (error) {
      console.log(`🔥 ${endpoint} - Connection Error: ${error.message}`);
    }

    console.log(""); // Empty line for readability
  }
}

// Test if backend server is running
async function testServerRunning() {
  try {
    const response = await fetch("http://localhost:8000", {
      method: "GET",
      timeout: 5000,
    });

    if (response.ok) {
      console.log("✅ Backend server is running on http://localhost:8000");
      return true;
    } else {
      console.log(`❌ Backend server responded with ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log("🔥 Backend server is not running or not accessible");
    console.log("   Make sure to run: npm start in the backend directory");
    return false;
  }
}

async function main() {
  console.log("🚀 Backend Connectivity Test\n");

  const isRunning = await testServerRunning();
  console.log("");

  if (isRunning) {
    await testEndpoints();
  }

  console.log("📋 Summary:");
  console.log("- If backend is not running: cd backend && npm start");
  console.log("- Check if all environment variables are set in backend/.env");
  console.log("- Verify database connection (Supabase)");
}

main().catch(console.error);
