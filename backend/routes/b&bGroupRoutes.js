import express from "express";
import multer from "multer";
import { 
    addBandBGroup, 
    mapBandBToGroup,
    updateBandBGroup, 
    deleteBandBGroup, 
    getAllBandBGroups, 
    getBandBGroupById,
    getGroupsByBandBId 
} from "../controller/b&bGroupController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", upload.any(), addBandBGroup);
router.post("/map-bandb", upload.none(), mapBandBToGroup);
router.put("/update/:id", upload.any(), updateBandBGroup);
router.delete("/delete/:id", deleteBandBGroup);
router.get("/list", getAllBandBGroups);
router.get("/:id", getBandBGroupById);
router.get("/by-bnb/:bnbId", getGroupsByBandBId);

export default router;