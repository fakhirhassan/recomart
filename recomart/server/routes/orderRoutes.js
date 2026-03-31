const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { orderValidators } = require('../utils/validators');
const orderController = require('../controllers/orderController');

router.post('/', auth, orderValidators.create, validate, orderController.createOrder);
router.get('/my-orders', auth, orderController.getMyOrders);

// Seller routes
router.get('/seller/orders', auth, roleCheck('seller'), orderController.getSellerOrders);
router.put('/seller/:id/status', auth, roleCheck('seller'), orderController.updateOrderStatus);

// Customer routes with params
router.get('/:id', auth, orderController.getOrderById);
router.put('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;
