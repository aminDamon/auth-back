const express = require('express');
const router = express.Router();
const ftpService = require('../services/ftpService');

// دانلود فایل با لینک مستقیم (بدون نیاز به احراز هویت)
router.get('/download/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        // بررسی پسوند فایل
        if (!filename.endsWith('.zip')) {
            return res.status(400).json({
                success: false,
                error: 'Only zip files can be downloaded'
            });
        }

        // تنظیم هدرها برای دانلود
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/zip');

        // ایجاد استریم فایل و ارسال به کاربر
        const fileStream = await ftpService.getFileStream(filename);
        
        // مدیریت خطاهای استریم
        fileStream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Download failed'
                });
            }
        });

        // ارسال فایل به کاربر
        fileStream.pipe(res);

        // مدیریت پایان استریم
        fileStream.on('end', () => {
            console.log('File download completed');
        });

        // مدیریت بسته شدن اتصال
        req.on('close', () => {
            fileStream.destroy();
        });

    } catch (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Download failed'
            });
        }
    }
});

module.exports = router; 