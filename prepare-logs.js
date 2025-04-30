const fs = require('fs');
const readline = require('readline');

async function convertLogs() {
    const inputFile = './logs.txt';
    const outputFile = './logs_prepared.txt';
    const writeStream = fs.createWriteStream(outputFile);
    
    const rl = readline.createInterface({
        input: fs.createReadStream(inputFile),
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        // Parse log line
        const match = line.match(/^(\S+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^"]+)\s+HTTP\/[\d.]+"\s+(\d+)\s+(\d+)\s+[^"]*"([^"]*)"$/);
        
        if (match) {
            const [_, ip, datetime, method, path, statusCode, responseSize, userAgent] = match;
            
            // Write in tab-separated format
            writeStream.write(`${ip}\t${datetime}\t${method}\t${path}\t${'HTTP/1.1'}\t${statusCode}\t${responseSize}\t${userAgent}\n`);
        }
    }

    writeStream.end();
    console.log('Log file prepared for import');
}

convertLogs();