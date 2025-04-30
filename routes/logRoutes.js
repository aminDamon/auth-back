const express = require('express');
const router = express.Router();
const logService = require('../services/logService');

// Get logs with filters
router.get('/logs', async (req, res) => {
    try {
        const filters = {
            ip: req.query.ip,
            serial: req.query.serial,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            statusCodes: req.query.statusCodes,
            filterType: req.query.filterType,
            path: req.query.path
        };

        const logs = await logService.getLogs(filters);
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get status code statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await logService.getStatusCodeStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get unique IPs
router.get('/ips', async (req, res) => {
    try {
        const ips = await logService.getUniqueIPs();
        res.json({ success: true, ips });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get logs with filters (alternative route)
router.get('/filter-logs', async (req, res) => {
    try {
        const filters = {
            ip: req.query.ip,
            serial: req.query.serial,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            statusCodes: req.query.statusCodes,
            filterType: req.query.filterType,
            path: req.query.path
        };

        const logs = await logService.getLogs(filters);
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;