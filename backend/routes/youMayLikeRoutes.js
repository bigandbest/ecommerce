import express from "express";
import {
  mapProductToYouMayLike,
  removeProductFromYouMayLike,
  getYouMayLikeProducts,
  getYouMayLikeProductById,
  bulkAddByNames
} from "../controller/youMayLikeController.js";

const router = express.Router();

// Route to map a single product to the "You May Like" section
router.post("/map", mapProductToYouMayLike);

// Route to remove a product from the "You May Like" section
router.delete("/remove", removeProductFromYouMayLike);

// Route to get all products in the "You May Like" section
router.get("/list", getYouMayLikeProducts);

// Route to get a specific product by ID in the "You May Like" section
router.get("/:id", getYouMayLikeProductById);

// Route to bulk add products by name to the "You May Like" section
router.post("/bulk-add-by-names", bulkAddByNames);

export default router;