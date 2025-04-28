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
    origin: [
        'https://ftp.safescap.ir', 
        'https://ftp-safenet.liara.run', 
        'https://safenet.liara.run',
        'http://localhost:3000',
        'https://safeupdate.safenet-co.net'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization']
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'https://safenet.liara.run');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    next();
});

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
const PORT = process.env.PORT || 5001;
const startServer = async () => {
    try {
        console.log('Attempting to connect to database...');
        await sequelize.authenticate();
        console.log('Database connection established.');

        if (process.env.NODE_ENV !== 'production') {
            console.log('Syncing database...');
            await sequelize.sync();
            console.log('Database synced.');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Server URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();