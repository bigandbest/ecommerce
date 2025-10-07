import express from "express";
import multer from "multer";
import { 
    addQuickPick,
    updateQuickPick,
    deleteQuickPick,
    getAllQuickPicks,
    getQuickPickById
} from '../controller/quickPickController.js'

const router = express.Router();
const upload = multer();

router.post('/add', upload.single("image_url"), addQuickPick);
router.put('/update/:id', upload.single("image_url"), updateQuickPick);
router.delete('/delete/:id', deleteQuickPick);
router.get('/list', getAllQuickPicks);
router.get('/:id', getQuickPickById);

export default router;