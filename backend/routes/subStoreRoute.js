import express from "express";
import multer from "multer";
import { addSubStore, updateSubStore, deleteSubStore, getAllSubStores } from "../controller/subStoreController.js";

const router = express.Router();
const upload = multer();

router.post("/add", upload.single("image"), addSubStore);
router.put("/update/:id", upload.single("image"), updateSubStore);
router.delete("/delete/:id", deleteSubStore);
router.get("/fetch", getAllSubStores);

export default router;
