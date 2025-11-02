import express from 'express';
import {
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant
} from '../controller/variantController.js';

const router = express.Router();

// Get product variants
router.get('/product/:productId', getProductVariants);

// Add product variant (Admin)
router.post('/add', addProductVariant);

// Update product variant (Admin)
router.put('/update/:id', updateProductVariant);

// Delete product variant (Admin)
router.delete('/delete/:id', deleteProductVariant);

export default router;