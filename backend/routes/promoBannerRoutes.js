import express from "express";
import {
  getAllPromoBanners,
  addPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  togglePromoBannerStatus,
} from "../controller/promoBannerController.js";

const router = express.Router();

// Get all promo banners
router.get("/all", getAllPromoBanners);

// Add promo banner
router.post("/add", addPromoBanner);

// Update promo banner
router.put("/update/:id", updatePromoBanner);

// Delete promo banner
router.delete("/delete/:id", deletePromoBanner);

// Toggle banner status
router.put("/toggle/:id", togglePromoBannerStatus);

export default router;