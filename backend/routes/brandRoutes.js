import express from "express";
import multer from "multer";
import { 
    addBrand,
    editBrand,
    deleteBrand,
    getAllBrands,
    getSingleBrand
} from '../controller/brandController.js'

const router = express.Router();
const upload = multer();

router.post('/add', upload.single("image_url"), addBrand);
router.put('/update/:id', upload.single("image_url"), editBrand);
router.delete('/delete/:id', deleteBrand);
router.get('/list', getAllBrands);
router.get('/:id', getSingleBrand);

export default router;