const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', authenticateToken, productController.getAllProducts);
router.get('/:id', authenticateToken, productController.getProductById);
router.post('/', authenticateToken, isAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticateToken, isAdmin, productController.deleteProduct);

module.exports = router; 