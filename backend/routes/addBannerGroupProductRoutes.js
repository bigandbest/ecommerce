import { Router } from "express";
import {
  mapProductToBannerGroup,
  removeProductFromBannerGroup,
  getBannerGroupsForProduct,
  getProductsForBannerGroup,
  bulkMapByNames,
} from "../controller/addBannerGroupProductController.js";

const router = Router();

// 1️⃣ Map a single product to a Banner Group
router.post("/map", mapProductToBannerGroup);

// 2️⃣ Remove a product from a Banner Group
router.delete("/remove", removeProductFromBannerGroup);

// 3️⃣ Get all Banner Groups for a product
router.get("/by-product/:product_id", getBannerGroupsForProduct);

// 4️⃣ Get all products for a Banner Group
router.get("/by-group/:add_banner_group_id", getProductsForBannerGroup);

// 5️⃣ Bulk map products by names
router.post("/bulk-map", bulkMapByNames);

export default router;
