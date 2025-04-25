const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        // 1. دریافت توکن از هدر Authorization
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'لطفاً ابتدا وارد شوید'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token from header:', token);
        console.log('Decoded token:', jwt.decode(token));

        // 2. بررسی اعتبار توکن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Verified token payload:', decoded);

        // 3. ذخیره اطلاعات کاربر
        req.user = decoded;

        next();
    } catch (err) {
        console.error('خطای احراز هویت:', err);
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            expiredAt: err.expiredAt
        });

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