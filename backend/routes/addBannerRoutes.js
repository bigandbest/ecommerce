import { Router } from "express";
import {
  addBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
  getBannerById,
  getBannersByType,
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

// Get all Banners by a specific type (e.g., /api/banner/type/homepage)
router.get("/type/:bannerType", getBannersByType);


export default router;