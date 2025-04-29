const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, isAdmin, isStaff } = require('../middlewares/auth');

router.get('/', authenticateToken, orderController.getAllOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.post('/', authenticateToken, isStaff, orderController.createOrder);
router.put('/:id/status', authenticateToken, isAdmin, orderController.updateOrderStatus);

module.exports = router; 