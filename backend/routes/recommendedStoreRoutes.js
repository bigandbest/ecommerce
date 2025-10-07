import express from "express";
import multer from "multer";
import { 
    addRecommendedStore,
    editRecommendedStore,
    deleteRecommendedStore,
    getAllRecommendedStores,
    getSingleRecommendedStore
} from '../controller/recommendedStoreController.js'

const router = express.Router();
const upload = multer();

router.post('/add', upload.single("image_url"), addRecommendedStore);
router.put('/update/:id', upload.single("image"), editRecommendedStore);
router.delete('/delete/:id', deleteRecommendedStore);
router.get('/list', getAllRecommendedStores);
router.get('/:id', getSingleRecommendedStore);

export default router;