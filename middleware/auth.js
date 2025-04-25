const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        // 1. دریافت توکن از هدر Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'لطفاً ابتدا وارد شوید'
            });
        }

        const token = authHeader.split(' ')[1];

        // 2. بررسی اعتبار توکن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. ذخیره اطلاعات کاربر
        req.user = decoded;

        next();
    } catch (err) {
        console.error('خطای احراز هویت:', err);

        // پیام‌های خطای مناسب
        let errorMessage = 'خطای احراز هویت';
        if (err.name === 'JsonWebTokenError') {
            errorMessage = 'توکن نامعتبر';
        } else if (err.name === 'TokenExpiredError') {
            errorMessage = 'توکن منقضی شده است';
        }

        res.status(401).json({
            success: false,
            error: errorMessage
        });
    }
};

module.exports = authenticate;