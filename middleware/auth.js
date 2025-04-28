const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        console.log('Authentication request received:', {
            path: req.path,
            method: req.method,
            headers: {
                authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : 'Not provided',
                origin: req.headers.origin
            },
            cookies: req.cookies ? 'Present' : 'Not present'
        });

        // 1. دریافت توکن از هدر Authorization یا کوکی
        let token;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            console.error('No token found in headers or cookies');
            return res.status(401).json({
                success: false,
                error: 'لطفاً ابتدا وارد شوید'
            });
        }

        console.log('Token extracted, verifying...');

        // 2. بررسی اعتبار توکن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', {
            userId: decoded.id,
            role: decoded.role
        });

        // 3. ذخیره اطلاعات کاربر
        req.user = decoded;

        next();
    } catch (err) {
        console.error('Authentication error:', {
            name: err.name,
            message: err.message,
            stack: err.stack
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
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = authenticate;