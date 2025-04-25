const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// مسیرهای احراز هویت
router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/login-password', authController.loginWithPassword);
router.post('/login-email', authController.loginWithEmail);
router.get('/me', authenticate, authController.getCurrentUser);

// مسیر لاگین ادمین
router.post('/admin/login', authController.loginAdmin);

module.exports = router;