const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// Lấy danh sách nhân viên (yêu cầu quyền admin)
router.get('/', authenticateToken, isAdmin, userController.getUsers);

// Lấy thông tin một nhân viên (yêu cầu quyền admin)
router.get('/:id', authenticateToken, isAdmin, userController.getUserById);

// Thêm nhân viên mới (yêu cầu quyền admin)
router.post('/', authenticateToken, isAdmin, userController.createUser);

// Cập nhật thông tin nhân viên (yêu cầu quyền admin)
router.put('/:id', authenticateToken, isAdmin, userController.updateUser);

// Xóa nhân viên (yêu cầu quyền admin)
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);

module.exports = router; 