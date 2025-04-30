const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const checkAdmin = require('../middleware/checkAdmin');

// همه route ها نیاز به احراز هویت و دسترسی admin دارند
router.use(authenticate, checkAdmin);

// دریافت لیست کاربران
router.get('/', userController.getUsers);

// ایجاد کاربر جدید
router.post('/', userController.createUser);

// تغییر رمز عبور کاربر
router.post('/:userId/change-password', userController.changeUserPassword);

// حذف کاربر
router.delete('/:userId', userController.deleteUser);

// ویرایش کاربر
router.put('/:userId', userController.updateUser);

module.exports = router; 