import { Router } from "express";
import {
  addBannerGroup,
  mapBannerToGroup,
  updateBannerGroup,
  deleteBannerGroup,
  getAllBannerGroups,
  getBannerGroupById,
  getGroupsByBannerId,
} from "../controller/addBannerGroupController.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Add a Banner Group
router.post("/add", upload.single("image_url"), addBannerGroup);

// Map a Banner to a Banner Group
router.post("/map-to-banner", mapBannerToGroup);

// Update a Banner Group with optional image upload
router.put("/update/:id", upload.single("image_url"), updateBannerGroup);

// Delete a Banner Group
router.delete("/delete/:id", deleteBannerGroup);

// Get all Banner Groups
router.get("/all", getAllBannerGroups);

// Get a single Banner Group by ID
router.get("/:id", getBannerGroupById);

// Get all Banner Groups for a specific Banner
router.get("/by-banner/:bannerId", getGroupsByBannerId);

export default router;