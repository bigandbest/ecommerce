import express from 'express';
import {
  getPincodeDetails,
  calculateShipping,
  calculateTax
} from '../controller/locationController.js';

const router = express.Router();

// Get pincode details
router.get('/pincode/:pincode', getPincodeDetails);

// Calculate shipping charges
router.post('/shipping/calculate', calculateShipping);

// Calculate tax
router.post('/tax/calculate', calculateTax);

export default router;