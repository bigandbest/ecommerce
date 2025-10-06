// --- BBM Dost Routes ---
// Defines all API endpoints for managing BBM Dost records.

import express from "express";
import {
  addDost,
  getAllDosts,
  getDostById,
  updateDost,
  deleteDost,
} from "../controller/bbmDostController.js";

const router = express.Router();

// ✅ 1. Add (Create) a new BBM Dost
// POST /api/bbm-dost/add
router.post("/add", addDost);

// ✅ 2. Get all BBM Dost entries
// GET /api/bbm-dost/all
router.get("/all", getAllDosts);

// ✅ 3. Get a single BBM Dost by ID
// GET /api/bbm-dost/:id
router.get("/:id", getDostById);

// ✅ 4. Update BBM Dost by ID
// PUT /api/bbm-dost/:id
router.put("/:id", updateDost);

// ✅ 5. Delete BBM Dost by ID
// DELETE /api/bbm-dost/:id
router.delete("/:id", deleteDost);

export default router;
