import express from 'express';
import { 
    mapProductToUniqueSection, 
    removeProductFromUniqueSection, 
    getUniqueSectionsForProduct, 
    getProductsForUniqueSection,
    bulkMapUniqueSectionByNames,
} from '../controller/uniqueSectionProductController.js'; // Adjust path as needed

const router = express.Router();

// POST: Map a single product to a section
router.post('/map', mapProductToUniqueSection);  // Done

// DELETE: Remove a product from a section
router.delete('/remove', removeProductFromUniqueSection);   // Done

// GET: Get all Unique Sections for a specific product
router.get('/product/:product_id', getUniqueSectionsForProduct);    // Done

// GET: Get all products for a specific Unique Section
router.get('/section/:unique_section_id', getProductsForUniqueSection);     // Done // add in supabaseApi

// POST: Bulk map products to a section using names
router.post('/bulk-map-by-names', bulkMapUniqueSectionByNames);

export default router;

