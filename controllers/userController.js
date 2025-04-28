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
exports.changeUserPassword = async (req, res) => {
    try {
        console.log('Change password request received:', {
            params: req.params,
            body: req.body,
            user: req.user
        });

        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!userId) {
            console.error('User ID is missing');
            return res.status(400).json({ error: 'شناسه کاربر الزامی است' });
        }

        if (!newPassword) {
            console.error('New password is missing');
            return res.status(400).json({ error: 'رمز عبور جدید الزامی است' });
        }

        if (newPassword.length < 6) {
            console.error('Password is too short');
            return res.status(400).json({ error: 'رمز عبور باید حداقل 6 کاراکتر باشد' });
        }

        console.log('Looking for user with ID:', userId);
        const user = await User.findByPk(userId);
        
        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }

        console.log('User found:', {
            id: user.id,
            username: user.username,
            email: user.email
        });

        // هش کردن رمز عبور جدید
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Password hashed successfully');

        // به‌روزرسانی رمز عبور
        await user.update({ password: hashedPassword });
        console.log('Password updated successfully');

        res.json({ 
            message: 'رمز عبور با موفقیت تغییر کرد',
            userId: user.id
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            error: 'خطا در تغییر رمز عبور',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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