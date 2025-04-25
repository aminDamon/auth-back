const express = require('express');
const cors = require('cors');
const app = express();
const ftpRoutes = require('./routes/ftpRoutes');
const cookieParser = require('cookie-parser');

// بعد از سایر middlewareها
app.use('/api/ftp', ftpRoutes);

// تنظیمات CORS
// اصلاح ترتیب middleware ها
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// سپس routes ها را اضافه کنید
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ftp', ftpRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));