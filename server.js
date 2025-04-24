const express = require('express');
const cors = require('cors');
const app = express();
const ftpRoutes = require('./routes/ftpRoutes');
const cookieParser = require('cookie-parser');

// بعد از سایر middlewareها
app.use('/api/ftp', ftpRoutes);

// تنظیمات CORS
app.use(cors({
    origin: 'http://localhost:3000', // آدرس دقیق فرانت‌اند
    credentials: true // برای کوکی‌ها و احراز هویت
}));

// سایر middlewareها
app.use(express.json());

app.use(cookieParser())

// routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/ftp', ftpRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));