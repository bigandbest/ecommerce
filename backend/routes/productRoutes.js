import express from "express";
import {
  getAllProducts,
  getProductsByCategory,
  getAllCategories,
  getFeaturedProducts,
  getProductsWithFilters,
  getProductById,
  getQuickPicks,
  getProductsBySubcategory,
  getProductsByGroup,
} from "../controller/productController.js";

const router = express.Router();

router.get("/allproducts", getAllProducts);
router.get("/categories", getAllCategories);
router.get("/featured", getFeaturedProducts);
router.get("/filter", getProductsWithFilters);
router.get("/quick-picks", getQuickPicks);
router.get("/category/:category", getProductsByCategory);
router.get("/subcategory/:subcategoryId", getProductsBySubcategory);
router.get("/group/:groupId", getProductsByGroup);
router.get("/:id", getProductById);

export default router;
