import express from "express";
import multer from "multer";
import {
    addBandB,
    updateBandB,
    deleteBandB,
    getAllBandBs,
    getBandBById
} from '../controller/b&bController.js'

const router = express.Router();
const upload = multer();

router.post('/add', upload.single("image_url"), addBandB);
router.put('/update/:id', upload.single("image_url"), updateBandB);
router.delete('/delete/:id', deleteBandB);
router.get('/list', getAllBandBs);
router.get('/:id', getBandBById);

export default router;