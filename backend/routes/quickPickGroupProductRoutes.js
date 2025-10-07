import express from "express";
import {
  mapProductToQuickPickGroup,
  removeProductFromQuickPickGroup,
  getQuickPickGroupsForProduct,
  getProductsForQuickPickGroup,
  bulkMapByNames,
} from "../controller/quickPickGroupProductController.js";

const router = express.Router();

// Route to map a product to a quick pick group
router.post("/map", mapProductToQuickPickGroup);

// Route to remove a product from a quick pick group
router.delete("/remove", removeProductFromQuickPickGroup);

// Route to get all quick pick groups containing a specific product
router.get("/getGroupsByProduct/:product_id", getQuickPickGroupsForProduct);

// Route to get all products within a specific quick pick group
router.get("/getProductsByGroup/:quick_pick_group_id", getProductsForQuickPickGroup);

// Route to bulk map products to a quick pick group by names
router.post("/bulk-map", bulkMapByNames);

export default router;