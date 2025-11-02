import express from "express";
import {
  getAllProductSections,
  getActiveProductSections,
  getProductSectionById,
  updateProductSection,
  toggleSectionStatus,
  updateSectionOrder,
} from "../controller/productSectionController.js";

const router = express.Router();

// Get all product sections
router.get("/", getAllProductSections);

// Get active product sections only
router.get("/active", getActiveProductSections);

// Get single product section by ID
router.get("/:id", getProductSectionById);

// Update product section
router.put("/:id", updateProductSection);

// Toggle section active status
router.patch("/:id/toggle", toggleSectionStatus);

// Update section display order
router.patch("/order", updateSectionOrder);

export default router;
