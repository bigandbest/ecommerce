import express from "express";
import {
  getAllProductSections,
  createStoreSectionMapping,
  createSectionProductMapping,
  getAllMappings,
  updateMappingStatus,
  deleteMapping,
  getProductsBySection,
} from "../controller/storeSectionMappingController.js";

const router = express.Router();

// Product sections routes
router.get("/product-sections/list", getAllProductSections);

// Store-section mapping routes
router.post("/store-sections", createStoreSectionMapping);
router.post("/section-products", createSectionProductMapping);
router.get("/list", getAllMappings);
router.put("/:id/status", updateMappingStatus);
router.delete("/:id", deleteMapping);

// Frontend route for getting products by section
router.get("/section/:section_key/products", getProductsBySection);

export default router;
