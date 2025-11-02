import express from "express";
import multer from "multer";
import {
  addDailyDeal,
  updateDailyDeal,
  deleteDailyDeal,
  getAllDailyDeals,
  getDailyDealById,
} from "../controller/dailyDealsController.js";

const router = express.Router();
const upload = multer();

router.post("/add", upload.single("image_url"), addDailyDeal);
router.put("/update/:id", upload.single("image_url"), updateDailyDeal);
router.delete("/delete/:id", deleteDailyDeal);
router.get("/list", getAllDailyDeals);
router.get("/:id", getDailyDealById);

export default router;
