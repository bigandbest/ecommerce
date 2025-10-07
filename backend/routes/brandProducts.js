import express from 'express'
const router = express.Router();

import {
    mapProductToBrand,
    removeProductFromBrand,
    getBrandsForProduct,
    getProductsForBrand,
    bulkMapByNames
} from '../controller/brandProductController.js'

// Map a single product to a Brand (by ID)
router.post('/map', mapProductToBrand);

// Bulk map using names (for admin UI)
router.post('/map-bulk', bulkMapByNames);

// Remove product from a Brand
router.post('/remove', removeProductFromBrand);

// Get all Brands for a product
router.get('/product/:product_id', getBrandsForProduct);

// Get all products in a Brand
router.get('/:brand_id', getProductsForBrand);

export default router;