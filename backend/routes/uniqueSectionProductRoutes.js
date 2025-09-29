import express from "express";
import {
  mapProductToSection,
  removeProductFromSection,
  getSectionsForProduct,
  getProductsForSection,
  bulkMapByNames,
} from '../controller/uniqueSectionProductController.js';

const router = express.Router();

// 1️⃣ Map a product to a Section
router.post("/map", mapProductToSection);

// 2️⃣ Remove a product from a Section
router.delete("/remove", removeProductFromSection);

// 3️⃣ Get all Sections containing a product
router.get("/sections/:product_id", getSectionsForProduct);

// 4️⃣ Get all Products in a Section
router.get("/products/:section_id", getProductsForSection);

// 5️⃣ Bulk map products by names and Section name
router.post("/bulk-map", bulkMapByNames);

export default router;
