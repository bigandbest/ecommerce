import { Router } from "express";
import {
  addBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
  getBannerById
} from "../controller/addBannerController.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Add a Banner with image upload
router.post("/add", upload.single("image"), addBanner);

// Update a Banner with optional image upload
router.put("/update/:id", upload.single("image"), updateBanner);

// Delete a Banner
router.delete("/delete/:id", deleteBanner);

// Get all Banners
router.get("/all", getAllBanners);

// Get a single Banner by ID
router.get("/:id", getBannerById);

export default router;