const User = require('../models/User');

const checkAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'شما دسترسی لازم برای این عملیات را ندارید' });
        }
        
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ error: 'خطا در بررسی دسترسی' });
    }
};

module.exports = checkAdmin; 