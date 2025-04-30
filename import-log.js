const fs = require('fs');
const readline = require('readline');
const { sequelize } = require('./config/db');
const Log = require('./models/Log');
const path = require('path');

async function importLogs() {
    try {
        // مسیر کامل فایل لاگ
        const logPath = path.join(__dirname, 'logs.txt');
        
        // بررسی وجود فایل
        if (!fs.existsSync(logPath)) {
            console.error('Error: logs.txt file not found!');
            process.exit(1);
        }

        const fileStream = fs.createReadStream(logPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        console.log('Starting log import...');
        let count = 0;
        const batchSize = 1000;
        let batch = [];

        for await (const line of rl) {
            try {
                // Parse log line with more flexible regex
                const match = line.match(/^(\S+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^"]+)\s+HTTP\/[\d.]+"\s+(\d+)\s+(\d+)\s+[^"]*"([^"]*)"$/);
                
                if (match) {
                    const [_, ip, datetime, method, path, statusCode, responseSize, userAgent] = match;
                    
                    const logEntry = {
                        ip_address: ip,
                        timestamp: new Date(datetime),
                        method: method,
                        path: path.trim(),
                        http_version: 'HTTP/1.1', // Default value
                        status_code: parseInt(statusCode),
                        response_size: parseInt(responseSize),
                        user_agent: userAgent.trim()
                    };

                    batch.push(logEntry);
                    count++;

                    // Insert in batches
                    if (batch.length >= batchSize) {
                        await Log.bulkCreate(batch);
                        console.log(`Imported ${count} logs...`);
                        batch = [];
                    }
                } else {
                    console.warn('Could not parse line:', line);
                }
            } catch (parseError) {
                console.warn('Error parsing line:', line, parseError);
                continue;
            }
        }

        // Insert remaining logs
        if (batch.length > 0) {
            await Log.bulkCreate(batch);
        }

        console.log(`Import completed. Total logs imported: ${count}`);
        
    } catch (error) {
        console.error('Error importing logs:', error);
    } finally {
        await sequelize.close();
    }
}

// Make sure database is connected before starting import
sequelize.authenticate()
    .then(() => {
        console.log('Database connected, starting import...');
        importLogs();
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });