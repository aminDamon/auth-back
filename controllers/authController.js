const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');
const User = require('../models/User');
const { Op } = require('sequelize');

// تابع ثبت‌نام
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

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
            role: 'user',
            isVerified: false
        });

        res.status(201).json({
            message: 'ثبت‌نام با موفقیت انجام شد',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'خطا در ثبت‌نام' });
    }
};

// تابع تأیید ایمیل
exports.verify = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({
            where: {
                email,
                verificationToken: code,
                verificationTokenExpire: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'کد تأیید نامعتبر یا منقضی شده است' });
        }

        await user.update({
            isVerified: true,
            verificationToken: null,
            verificationTokenExpire: null
        });

        res.json({ message: 'حساب کاربری با موفقیت تأیید شد' });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'خطا در تأیید حساب کاربری' });
    }
};

require('dotenv').config(); 

// تابع ورود با رمز عبور
exports.loginWithPassword = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ error: 'لطفاً ابتدا حساب کاربری خود را تأیید کنید' });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        // اضافه کردن کوکی isAdmin برای کاربران ادمین
        if (user.role === 'admin') {
            res.cookie('isAdmin', 'true', {
                httpOnly: false,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/'
            });
        }

        res.json({
            message: 'ورود با موفقیت انجام شد',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'خطا در ورود' });
    }
};

// تابع ورود با ایمیل
exports.loginWithEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: 'کاربری با این ایمیل یافت نشد' });
        }

        const verificationCode = crypto.randomBytes(3).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 دقیقه

        await user.update({
            verificationToken: verificationCode,
            verificationTokenExpire: expiresAt
        });

        await sendVerificationEmail(email, verificationCode);

        res.json({ message: 'کد تأیید به ایمیل شما ارسال شد' });
    } catch (error) {
        console.error('Email login error:', error);
        res.status(500).json({ error: 'خطا در ارسال کد تأیید' });
    }
};

// دریافت اطلاعات کاربر فعلی
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'email', 'role']
        });
        
        if (!user) {
            return res.status(404).json({ error: 'کاربر یافت نشد' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'خطا در دریافت اطلاعات کاربر' });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // یافتن کاربر با نام کاربری
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        // بررسی رمز عبور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        // بررسی نقش ادمین
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'شما دسترسی ادمین ندارید' });
        }

        // تولید توکن
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // تنظیم کوکی
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 ساعت
        });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({ message: 'خطای سرور' });
    }
};