import express from "express";
import multer from "multer";
import { 
    addSavingZone,
    updateSavingZone,
    deleteSavingZone,
    getAllSavingZones,
    getSavingZoneById
} from '../controller/savingZoneController.js'

const router = express.Router();
const upload = multer();

router.post('/add', upload.single("image_url"), addSavingZone);
router.put('/update/:id', upload.single("image_url"), updateSavingZone);
router.delete('/delete/:id', deleteSavingZone);
router.get('/list', getAllSavingZones);
router.get('/:id', getSavingZoneById);

export default router;