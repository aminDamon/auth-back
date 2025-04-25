const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ftpRoutes = require('./routes/ftpRoutes');
const publicFtpRoutes = require('./routes/publicFtpRoutes');
const { authenticate } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({
    origin: 'https://ftp.safescap.ir',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ftp', ftpRoutes);
app.use('/api/public-ftp', publicFtpRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync();
            console.log('Database synced.');
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();