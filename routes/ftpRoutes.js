const express = require('express');
const router = express.Router();
const ftpService = require('../services/ftpService');
const authenticate = require('../middleware/auth');

// لیست فایل‌ها
router.get('/list', authenticate, async (req, res) => {
    try {
        const files = await ftpService.listFiles();
        res.json({ success: true, files });
        // در میدلور authenticate
        console.log('Received token:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch files'
        });
    }
});

// دانلود فایل با لینک مستقیم
router.get('/download/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        // تنظیم هدرها برای دانلود
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // ایجاد استریم فایل و ارسال به کاربر
        const fileStream = await ftpService.getFileStream(filename);
        fileStream.pipe(res);

    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Download failed'
        });
    }
});

// ایجاد لینک عمومی برای دانلود
router.get('/public-link/:filename', authenticate, async (req, res) => {
    try {
        const { filename } = req.params;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const downloadLink = `${baseUrl}/api/ftp/download/${encodeURIComponent(filename)}`;

        res.json({
            success: true,
            downloadLink: downloadLink
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate link'
        });
    }
});

module.exports = router;