import express from "express";
import {
  mapProductToBandBGroup,
  removeProductFromBandBGroup,
  getBandBGroupsForProduct,
  getProductsForBandBGroup,
  bulkMapByNames,
} from "../controller/b&bGroupProductController.js";

const router = express.Router();

// Route to map a product to a b&b group
router.post("/map", mapProductToBandBGroup);

// Route to remove a product from a b&b group
router.delete("/remove", removeProductFromBandBGroup);

// Route to get all b&b groups containing a specific product
router.get("/getGroupsByProduct/:product_id", getBandBGroupsForProduct);

// Route to get all products within a specific b&b group
router.get("/getProductsByGroup/:bnb_group_id", getProductsForBandBGroup);

// Route to bulk map products to a b&b group by names
router.post("/bulk-map", bulkMapByNames);

export default router;