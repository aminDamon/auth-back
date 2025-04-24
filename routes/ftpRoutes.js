const express = require('express');
const router = express.Router();
const ftpService = require('../services/ftpService');
const authenticate = require('../middleware/auth');

// لیست فایل‌ها
router.get('/list', authenticate, async (req, res) => {
    try {
        const files = await ftpService.listFiles();
        res.json({ success: true, files });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch files'
        });
    }
});

// دانلود فایل
router.get('/download/:filename', authenticate, async (req, res) => {
    try {
        const { filename } = req.params;
        const tempPath = `/tmp/${filename}`;

        await ftpService.downloadFile(filename, tempPath);

        res.download(tempPath, filename, (err) => {
            if (err) console.error('Download error:', err);
            // حذف فایل موقت پس از دانلود
            require('fs').unlinkSync(tempPath);
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Download failed'
        });
    }
});

module.exports = router;