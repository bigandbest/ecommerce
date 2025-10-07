import express from "express";
import {
  mapProductToSavingZoneGroup,
  removeProductFromSavingZoneGroup,
  getSavingZoneGroupsForProduct,
  getProductsForSavingZoneGroup,
  bulkMapByNames,
  getGroupsBySavingZoneId // Make sure this is imported
} from "../controller/savingZoneGroupProductController.js";

const router = express.Router();

// Route to map a product to a saving zone group
router.post("/map", mapProductToSavingZoneGroup);

// Route to remove a product from a saving zone group
router.delete("/remove", removeProductFromSavingZoneGroup);

// Route to get all saving zone groups containing a specific product
router.get("/getGroupsByProduct/:product_id", getSavingZoneGroupsForProduct);

// Route to get all products within a specific saving zone group
router.get(
  "/getProductsByGroup/:saving_zone_group_id",
  getProductsForSavingZoneGroup
);

// Route to bulk map products to a saving zone group by names
router.post("/bulk-map", bulkMapByNames);

// New: Route to get all groups for a specific saving zone
router.get("/getGroupsBySavingZone/:savingZoneId", getGroupsBySavingZoneId);

export default router;  