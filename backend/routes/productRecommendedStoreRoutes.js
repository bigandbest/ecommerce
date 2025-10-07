import express from 'express'
const router = express.Router();

import {
    mapProductToRecommendedStore,
    removeProductFromRecommendedStore,
    getRecommendedStoresForProduct,
    getProductsForRecommendedStore,
    bulkMapByNames
} from '../controller/productRecommendedStoreController.js'

// Map a single product to a Recommended Store (by ID)
router.post('/map', mapProductToRecommendedStore);

// Bulk map using names (for admin UI)
router.post('/map-bulk', bulkMapByNames);

// Remove product from a Recommended Store
router.post('/remove', removeProductFromRecommendedStore);

// Get all Recommended Stores for a product
router.get('/product/:product_id', getRecommendedStoresForProduct);

// Get all products in a Recommended Store
router.get('/:recommended_store_id', getProductsForRecommendedStore);

export default router;