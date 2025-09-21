import express from "express";
import multer from "multer";
import { 
  addQuickPickGroup, 
  mapQuickPickToGroup,
  updateQuickPickGroup, 
  deleteQuickPickGroup, 
  getAllQuickPickGroups, 
  getQuickPickGroupById,
  getGroupsByQuickPickId 
} from "../controller/quickPickGroupController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", upload.any(), addQuickPickGroup);
router.post("/map-quick-pick", upload.none(), mapQuickPickToGroup); // Use .none() for JSON data
router.put("/update/:id", upload.any(), updateQuickPickGroup);
router.delete("/delete/:id", deleteQuickPickGroup);
router.get("/list", getAllQuickPickGroups);
router.get("/:id", getQuickPickGroupById);
router.get("/by-quick-pick/:quickPickId", getGroupsByQuickPickId);

export default router;