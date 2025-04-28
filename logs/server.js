const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors({
    origin: ['http://192.168.67.48:3000', 'http://localhost:3000', 'http://192.168.3.216:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Body:`, req.body);
    next();
});

app.post('/filter-logs', (req, res) => {
    const { type, errors, ip, serial, includeSuccess, startDate, endDate } = req.body;

    if (!type) {
        console.error('Error: No filter type provided');
        return res.status(400).json({ success: false, error: 'Filter type is required' });
    }

    let command = 'node';
    let script;
    let args = [];

    if (type === 'success') {
        script = path.join(__dirname, 'logs-ip-serial.js');
        if (ip) args.push('--ip', ip);
        if (serial) args.push('--serial', serial);
    } else {
        script = path.join(__dirname, 'check-log.js');
        args.push('--type', type);
        if (ip) args.push('--ip', ip);
        if (serial) args.push('--serial', serial);
        if (type === 'specific' && errors) args.push('--errors', errors);
    }
    
    // اضافه کردن آرگومان‌های تاریخ
    if (startDate) args.push('--startDate', startDate);
    if (endDate) args.push('--endDate', endDate);

    console.log('Executing command:', command, script, args);

    const process = spawn(command, [script, ...args]);

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
        output += data.toString();
        console.log('stdout:', data.toString());
    });

    process.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('stderr:', data.toString());
    });

    process.on('close', (code) => {
        console.log('Process exited with code:', code);
        if (code === 0) {
            res.json({ success: true, output, file: 'output_file.txt' });
        } else {
            res.status(500).json({ success: false, error: errorOutput || 'Unknown error occurred' });
        }
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(3010, () => console.log('Server running on port 3010'));