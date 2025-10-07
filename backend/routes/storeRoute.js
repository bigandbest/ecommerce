import express from "express";
import multer from "multer";
import { addStore, updateStore, deleteStore, getAllStores } from "../controller/storeController.js";

const router = express.Router();
const upload = multer(); // memory storage by default

router.post("/add", upload.single("image"), addStore);
router.put("/update/:id", upload.single("image"), updateStore);
router.delete("/delete/:id", deleteStore);
router.get("/fetch", getAllStores);

export default router;
