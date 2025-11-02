import express from "express";
import {
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductsWithVariants,
} from "../controller/productVariantsController.js";

const router = express.Router();

// Get all products with variants
router.get("/products-with-variants", getProductsWithVariants);

// Get variants for a specific product
router.get("/product/:productId/variants", getProductVariants);

// Add variant to product
router.post("/product/:productId/variants", addProductVariant);

// Update variant
router.put("/variant/:variantId", updateProductVariant);

// Delete variant
router.delete("/variant/:variantId", deleteProductVariant);

export default router;