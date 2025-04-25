const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// دریافت لیست کاربران
exports.getUsers = async (req, res) => {
    try {
        console.log('Getting users...');
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'isVerified'],
            order: [['created_at', 'DESC']]
        });
        
        console.log('Users found:', users);
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست کاربران' });
    }
};

// ایجاد کاربر جدید
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // بررسی وجود کاربر
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'کاربر با این ایمیل یا نام کاربری قبلاً ثبت‌نام کرده است' });
        }

        // هش کردن رمز عبور
        const hashedPassword = await bcrypt.hash(password, 10);

        // ایجاد کاربر جدید
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user',
            isVerified: true
        });

        res.status(201).json({
            message: 'کاربر با موفقیت ایجاد شد',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'خطا در ایجاد کاربر' });
    }
};

// تغییر رمز عبور کاربر
exports.changePassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        // هش کردن رمز عبور جدید
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // به‌روزرسانی رمز عبور
        await user.update({ password: hashedPassword });

        res.json({ message: 'رمز عبور با موفقیت تغییر کرد' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'خطا در تغییر رمز عبور' });
    }
};

// حذف کاربر
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        // حذف کاربر
        await user.destroy();

        res.json({ message: 'کاربر با موفقیت حذف شد' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'خطا در حذف کاربر' });
    }
};

exports.changeUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'رمز عبور باید حداقل 6 کاراکتر باشد' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'کاربر یافت نشد' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({ message: 'رمز عبور با موفقیت تغییر کرد' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'خطا در تغییر رمز عبور' });
    }
}; 