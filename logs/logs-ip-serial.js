const fs = require('fs');

function parseLogLine(log) {
    const parts = log.trim().split('\t');
    if (parts.length < 3) return { ip: '', serial: '', status: '', date: '' };

    const ip = parts[0];
    const dateTime = parts[1];
    const dataPart = parts[2];

    const serialMatch = dataPart.match(/serial_number=([^&\s]+)/);
    const serial = serialMatch ? serialMatch[1] : '';

    const statusMatch = dataPart.match(/" (\d{3}) /);
    const status = statusMatch ? statusMatch[1] : '';

    return { ip, serial, status, date: dateTime.split(' ')[0] };
}

function filterSuccessfulLogs(logs, targetIp, targetSerial) {
    return logs.filter(log => {
        const { ip, serial, status } = log;
        const ipMatch = !targetIp || ip === targetIp;
        const serialMatch = !targetSerial || serial === targetSerial;
        const statusMatch = status === '200';
        return ipMatch && serialMatch && statusMatch;
    });
}

function filterByDate(logs, startDate, endDate) {
    if (!startDate && !endDate) return logs;

    return logs.filter(log => {
        const logDate = new Date(log.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        let valid = true;
        if (start && logDate < start) valid = false;
        if (end && logDate > end) valid = false;

        return valid;
    });
}

const args = process.argv.slice(2);
let ip = '';
let serial = '';
let startDate = '';
let endDate = '';

args.forEach((arg, index) => {
    if (arg === '--ip') ip = args[index + 1];
    else if (arg === '--serial') serial = args[index + 1];
    else if (arg === '--startDate') startDate = args[index + 1];
    else if (arg === '--endDate') endDate = args[index + 1];
});

try {
    const logContent = fs.readFileSync('logs.txt', 'utf8');
    let logs = logContent.trim().split('\n').map(log => {
        return { raw: log, ...parseLogLine(log) };
    });

    logs = filterByDate(logs, startDate, endDate);
    const successfulLogs = filterSuccessfulLogs(logs, ip, serial);

    if (successfulLogs.length > 0) {
        console.log(successfulLogs.map(log => log.raw).join('\n'));
    } else {
        console.log(`No successful logs found.${ip ? ` IP: ${ip}` : ''}${serial ? ` Serial: ${serial}` : ''}${startDate || endDate ? ` Date range: ${startDate || ''} - ${endDate || ''}` : ''}`);
    }
} catch (error) {
    console.error("Error reading file or processing logs:", error.message);
    process.exit(1);
}