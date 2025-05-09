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

// دانلود فایل با لینک مستقیم
router.get('/download/:filename', authenticate, async (req, res) => {
    let fileStream = null;
    
    try {
        const { filename } = req.params;
        
        // بررسی پسوند فایل
        if (!filename.endsWith('.zip')) {
            return res.status(400).json({
                success: false,
                error: 'Only zip files can be downloaded'
            });
        }

        // تنظیم timeout برای درخواست
        req.setTimeout(300000); // 5 دقیقه timeout برای درخواست

        // تنظیم هدرها برای دانلود
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/zip');

        // ایجاد استریم فایل و ارسال به کاربر
        fileStream = await ftpService.getFileStream(filename);
        
        // مدیریت خطاهای استریم
        fileStream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Download failed: ' + err.message
                });
            }
        });

        // ارسال فایل به کاربر
        fileStream.pipe(res);

        // مدیریت بسته شدن اتصال
        req.on('close', () => {
            if (fileStream) {
                fileStream.destroy();
            }
        });

    } catch (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
        res.status(500).json({
            success: false,
                error: 'Download failed: ' + err.message
        });
        }
    }
});

// ایجاد لینک عمومی برای دانلود
router.get('/public-link/:filename', authenticate, async (req, res) => {
    try {
        const { filename } = req.params;
        
        // بررسی پسوند فایل
        if (!filename.endsWith('.zip')) {
            return res.status(400).json({
                success: false,
                error: 'Only zip files can be downloaded'
            });
        }

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