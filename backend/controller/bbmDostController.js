// --- BBM Dost Controller ---
// Handles CRUD operations for the bbm_dost table using Supabase.

import { supabase } from "../config/supabaseClient.js";

// 1️⃣ Add (Create) a new BBM Dost entry
export async function addDost(req, res) {
  try {
    const {
      name,
      phone_no,
      email,
      role,
      pincode,
      district,
      state,
      organization_name,
      gst_no,
    } = req.body;

    // Basic validation
    if (!name || !phone_no || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, phone_no, and email are mandatory.",
      });
    }

    // Insert the new record
    const { data, error } = await supabase
      .from("bbm_dost")
      .insert([
        {
          name,
          phone_no,
          email,
          role,
          pincode,
          district,
          state,
          organization_name,
          gst_no,
        },
      ])
      .select()
      .single();

    if (error) {
      // Handle duplicate email or phone number
      if (error.code === "23505") {
        return res
          .status(409)
          .json({ success: false, error: "Email or Phone number already exists." });
      }
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(201).json({
      success: true,
      message: "BBM Dost added successfully.",
      dost: data,
    });
  } catch (err) {
    console.error("Error adding BBM Dost:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// 2️⃣ Get All BBM Dost entries
export async function getAllDosts(req, res) {
  try {
    console.log("Fetching all BBM Dosts...");
    const { data, error } = await supabase.from("bbm_dost").select("*");

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, dosts: data });
  } catch (err) {
    console.error("Error fetching BBM Dost list:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// 3️⃣ Get a Single BBM Dost by ID
export async function getDostById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("bbm_dost")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res
          .status(404)
          .json({ success: false, error: "BBM Dost not found." });
      }
      return res.status(400).json({ success: false, error: error.message });
    }

    if (!data)
      return res.status(404).json({ success: false, error: "BBM Dost not found." });

    res.status(200).json({ success: true, dost: data });
  } catch (err) {
    console.error("Error fetching BBM Dost by ID:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// 4️⃣ Update BBM Dost
export async function updateDost(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent accidental ID overwrite
    delete updateData.id;

    const { data, error } = await supabase
      .from("bbm_dost")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          error: "Email or Phone number already registered to another record.",
        });
      }
      if (error.code === "PGRST116") {
        return res
          .status(404)
          .json({ success: false, error: "BBM Dost not found or not updated." });
      }
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({
      success: true,
      message: "BBM Dost updated successfully.",
      dost: data,
    });
  } catch (err) {
    console.error("Error updating BBM Dost:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// 5️⃣ Delete BBM Dost
export async function deleteDost(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("bbm_dost").delete().eq("id", id);

    if (error)
      return res.status(400).json({ success: false, error: error.message });

    res
      .status(200)
      .json({ success: true, message: "BBM Dost deleted successfully." });
  } catch (err) {
    console.error("Error deleting BBM Dost:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
