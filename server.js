const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const authenticate = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { sequelize } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// تنظیمات CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Middleware ها
app.use(express.json());
app.use(cookieParser());

// Sync مدل‌ها با پایگاه داده
sequelize.sync({ force: false })
    .then(async () => {
        console.log('Database connected successfully');
        
        // بررسی وجود کاربر ادمین
        const adminExists = await User.findOne({ where: { role: 'admin' } });
        
        if (!adminExists) {
            console.log('Creating admin user...');
            // هش کردن رمز عبور
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            // ایجاد کاربر ادمین اولیه فقط در صورت عدم وجود
            await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ftp', authenticate, require('./routes/ftpRoutes'));
app.use('/api/public/ftp', require('./routes/publicFtpRoutes'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));