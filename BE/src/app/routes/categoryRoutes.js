const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

router.get('/', authenticateToken, categoryController.getAllCategories);
router.get('/:id', authenticateToken, categoryController.getCategoryById);
router.post('/', authenticateToken, isAdmin, categoryController.createCategory);
router.put('/:id', authenticateToken, isAdmin, categoryController.updateCategory);
router.delete('/:id', authenticateToken, isAdmin, categoryController.deleteCategory);

module.exports = router; 