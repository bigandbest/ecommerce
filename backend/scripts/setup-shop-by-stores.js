import { supabase } from "../config/supabaseClient.js";

async function createShopByStoresTable() {
  try {
    // Check if table exists
    const { data: existingData, error: checkError } = await supabase
      .from("shop_by_stores")
      .select("*")
      .limit(1);

    if (checkError && checkError.code === "PGRST116") {
      // Table doesn't exist, create it
      console.log("Table shop_by_stores does not exist. Creating...");

      // Insert initial data
      const initialData = [
        {
          title: "Office",
          image_url: "/office.png",
          subtitle: "Work Essentials",
        },
        {
          title: "Essentials",
          image_url: "/basket.png",
          subtitle: "Daily Needs",
        },
        { title: "Grocery", image_url: "/prod6.png", subtitle: "Fresh Items" },
        {
          title: "Electronics",
          image_url: "/prod7.png",
          subtitle: "Tech Gadgets",
        },
        { title: "Home", image_url: "/prod8.png", subtitle: "Living Space" },
        {
          title: "Sports",
          image_url: "/football.png",
          subtitle: "Fitness Gear",
        },
        { title: "Health", image_url: "/protien.png", subtitle: "Wellness" },
        {
          title: "Fashion",
          image_url: "/women1.png",
          subtitle: "Style & Trends",
        },
        { title: "Tech", image_url: "/phone.png", subtitle: "Latest Tech" },
      ];

      const { data, error } = await supabase
        .from("shop_by_stores")
        .insert(initialData)
        .select();

      if (error) {
        console.error("Error inserting data:", error);
      } else {
        console.log("Successfully created table and inserted data:", data);
      }
    } else if (existingData) {
      console.log("Table shop_by_stores already exists with data");
    } else {
      console.log("Table exists but no data found. Inserting initial data...");

      const initialData = [
        {
          title: "Office",
          image_url: "/office.png",
          subtitle: "Work Essentials",
        },
        {
          title: "Essentials",
          image_url: "/basket.png",
          subtitle: "Daily Needs",
        },
        { title: "Grocery", image_url: "/prod6.png", subtitle: "Fresh Items" },
        {
          title: "Electronics",
          image_url: "/prod7.png",
          subtitle: "Tech Gadgets",
        },
        { title: "Home", image_url: "/prod8.png", subtitle: "Living Space" },
        {
          title: "Sports",
          image_url: "/football.png",
          subtitle: "Fitness Gear",
        },
        { title: "Health", image_url: "/protien.png", subtitle: "Wellness" },
        {
          title: "Fashion",
          image_url: "/women1.png",
          subtitle: "Style & Trends",
        },
        { title: "Tech", image_url: "/phone.png", subtitle: "Latest Tech" },
      ];

      const { data, error } = await supabase
        .from("shop_by_stores")
        .insert(initialData)
        .select();

      if (error) {
        console.error("Error inserting data:", error);
      } else {
        console.log("Successfully inserted data:", data);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

createShopByStoresTable();
