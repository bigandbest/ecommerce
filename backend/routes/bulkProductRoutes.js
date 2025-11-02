import express from 'express';
import { getBulkProducts, updateBulkSettings, getProductBulkSettings } from '../controller/bulkProductController.js';

const router = express.Router();

router.get('/products', getBulkProducts);
router.get('/product/:product_id', getProductBulkSettings);
router.put('/settings/:product_id', updateBulkSettings);

export default router;