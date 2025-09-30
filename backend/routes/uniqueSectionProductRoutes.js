import express from "express";
import {
  mapProductToSection,
  removeProductFromSection,
  getProductsForSection,
  getSectionsForProduct,
  bulkMapByNames,
  getAllProducts,
  getSectionById,
} from "../controller/uniqueSectionProductController.js";

const router = express.Router();

router.post("/map", mapProductToSection);
router.delete("/remove", removeProductFromSection);
router.get("/products/:section_id", getProductsForSection);
router.get("/sections/:product_id", getSectionsForProduct);
router.post("/bulk-map", bulkMapByNames);
router.get("/all-products", getAllProducts);
router.get("/section/:section_id", getSectionById);

export default router;
