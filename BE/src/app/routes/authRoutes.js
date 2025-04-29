const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

router.post('/registerAdmin', authController.registerAdmin);
router.post('/login', authController.login);
router.post('/register', authenticateToken, isAdmin, authController.register);
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router; 