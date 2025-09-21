import express from "express";
import multer from "multer";
import { 
    addSavingZoneGroup, 
    mapSavingZoneToGroup,
    updateSavingZoneGroup, 
    deleteSavingZoneGroup, 
    getAllSavingZoneGroups, 
    getSavingZoneGroupById,
    getGroupsBySavingZoneId // <-- This is a new function from your controller
} from "../controller/savingZoneGroupController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", upload.any(), addSavingZoneGroup);
router.post("/map-saving-zone", upload.none(), mapSavingZoneToGroup); 
router.put("/update/:id", upload.any(), updateSavingZoneGroup);
router.delete("/delete/:id", deleteSavingZoneGroup);
router.get("/list", getAllSavingZoneGroups);
router.get("/:id", getSavingZoneGroupById);

// New: Route to get all groups for a specific saving zone
router.get("/getGroupsBySavingZoneId/:savingZoneId", getGroupsBySavingZoneId);

export default router;