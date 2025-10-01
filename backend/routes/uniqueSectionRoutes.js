// uniqueSectionRoutes.js
import express from "express";
import multer from "multer";

import {
  addUniqueSection,
  editUniqueSection,
  deleteUniqueSection,
  getAllUniqueSections,
  getSingleUniqueSection,
  getUniqueSectionsByType
} from '../controller/uniqueSectionController.js'; // Adjust path as needed

const router = express.Router();
// Configure multer to store files in memory for processing before uploading to Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// === Unique Section Routes ===

// GET all unique sections
router.get("/list", getAllUniqueSections); // add in supabaseApi

// GET a single unique section by ID
router.get("/:id", getSingleUniqueSection);

// POST a new unique section (requires file upload for image)
// 'image' is the field name expected in the form-data
router.post("/", upload.single("image_url"), addUniqueSection);

// PUT/PATCH to edit an existing unique section by ID (optional file upload)
// 'image' is the field name expected in the form-data
router.put("/:id", upload.single("image_url"), editUniqueSection);

// DELETE a unique section by ID
router.delete("/:id", deleteUniqueSection);

router.get("/type/:section_type", getUniqueSectionsByType);

export default router;