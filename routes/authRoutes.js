const express = require('express');
const router = express.Router();
const {
  register,
  verify,
  loginWithPassword,
  loginWithEmail
} = require('../controllers/authController');

router.post('/register', register);
router.post('/verify', verify);
router.post('/login-password', loginWithPassword);
router.post('/login-email', loginWithEmail);

module.exports = router;