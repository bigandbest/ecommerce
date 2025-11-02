import express from "express";
import multer from "multer";
import {
  getAllShopByStores,
  getShopByStoreById,
  createShopByStore,
  updateShopByStore,
  deleteShopByStore,
} from "../controller/shopByStoreController.js";

const router = express.Router();
const upload = multer();

// Routes
router.post("/add", upload.single("image_url"), createShopByStore);
router.put("/update/:id", upload.single("image"), updateShopByStore);
router.delete("/delete/:id", deleteShopByStore);
router.get("/list", getAllShopByStores);
router.get("/:id", getShopByStoreById);

export default router;
