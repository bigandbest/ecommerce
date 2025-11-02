import express from 'express';
import {
  createBulkOrderEnquiry,
  getBulkOrderEnquiries,
  updateBulkOrderEnquiry,
  createWholesaleBulkOrder,
  getWholesaleBulkOrders,
  updateWholesaleBulkOrder,
  createOrderWithBulkSupport
} from '../controller/bulkOrderController.js';

const router = express.Router();

// B2B Bulk Order Enquiry Routes
router.post('/enquiry', createBulkOrderEnquiry);
router.get('/enquiries', getBulkOrderEnquiries);
router.put('/enquiry/:id', updateBulkOrderEnquiry);

// Wholesale Bulk Order Routes (Integrated Checkout)
router.post('/wholesale', createWholesaleBulkOrder);
router.get('/wholesale', getWholesaleBulkOrders);
router.put('/wholesale/:id', updateWholesaleBulkOrder);

// Enhanced order creation with bulk support
router.post('/order-with-bulk-support', createOrderWithBulkSupport);

export default router;