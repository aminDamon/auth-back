const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// مسیرهای احراز هویت
router.post('/register', authController.register);
router.post('/login', authController.loginWithPassword);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.getCurrentUser);

// مسیر لاگین ادمین
router.post('/admin/login', authController.loginAdmin);

module.exports = router;