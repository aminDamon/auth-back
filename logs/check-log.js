const fs = require('fs');

const errorStatusCodes = [
    '304', '400', '401', '403', '404', '405', '406', '407', '408', '409',
    '410', '411', '412', '413', '414', '415', '416', '417', '500', '501',
    '502', '503', '504', '505'
];

function parseLogLine(log) {
    const parts = log.trim().split('\t');
    if (parts.length < 3) return { ip: '', status: '', date: '' };

    const ip = parts[0];
    const dateTime = parts[1];
    const dataPart = parts[2];

    const statusMatch = dataPart.match(/" (\d{3}) /);
    const status = statusMatch ? statusMatch[1] : '';

    return { ip, status, date: dateTime.split(' ')[0], raw: log };
}

function filterLogs(logs, filterType, errorCodes) {
    let errorLogs = [];

    if (filterType === 'all') {
        errorStatusCodes.forEach(code => {
            logs.forEach(log => {
                if (log.status === code) {
                    errorLogs.push(log);
                }
            });
        });
    } else if (filterType === 'specific') {
        const codes = errorCodes.split(',').map(code => code.trim());
        logs.forEach(log => {
            if (codes.includes(log.status)) {
                errorLogs.push(log);
            }
        });
    }

    return errorLogs;
}

function filterByIp(logs, ip) {
    if (!ip) return logs;
    return logs.filter(log => log.ip === ip);
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
let filterType = '';
let errorCodes = '';
let ip = '';
let startDate = '';
let endDate = '';

args.forEach((arg, index) => {
    if (arg === '--type') filterType = args[index + 1]?.toLowerCase();
    else if (arg === '--errors') errorCodes = args[index + 1];
    else if (arg === '--ip') ip = args[index + 1];
    else if (arg === '--startDate') startDate = args[index + 1];
    else if (arg === '--endDate') endDate = args[index + 1];
});

if (!filterType) {
    console.error("Error: No filter type specified. Use --type followed by 'all' or 'specific'.");
    process.exit(1);
}

if (filterType !== 'all' && filterType !== 'specific') {
    console.error("Error: Invalid filter type. Use 'all' or 'specific'.");
    process.exit(1);
}

if (filterType === 'specific' && !errorCodes) {
    console.error("Error: No error codes specified for 'specific' type. Use --errors followed by comma-separated status codes.");
    process.exit(1);
}

try {
    const logContent = fs.readFileSync('logs.txt', 'utf8');
    let logs = logContent.trim().split('\n').map(log => parseLogLine(log));

    logs = filterByDate(logs, startDate, endDate);
    let filteredByIp = filterByIp(logs, ip);
    const errorLogs = filterLogs(filteredByIp, filterType, errorCodes);

    if (errorLogs.length > 0) {
        console.log(errorLogs.map(log => log.raw).join('\n'));

        const outputFile = filterType === 'all'
            ? (ip ? `all_errors_${ip.replace(/\./g, '_')}_logs.txt` : 'all_errors_logs.txt')
            : (ip ? `errors_${errorCodes.replace(',', '_')}_${ip.replace(/\./g, '_')}_logs.txt` : `errors_${errorCodes.replace(',', '_')}_logs.txt`);

        fs.writeFileSync(outputFile, errorLogs.map(log => log.raw).join('\n'), 'utf8');
    } else {
        console.log(`No logs found with the specified criteria${ip ? ` for IP ${ip}` : ''}${startDate || endDate ? ` in date range ${startDate || ''} - ${endDate || ''}` : ''}.`);
    }
} catch (error) {
    console.error("Error reading file or processing logs:", error.message);
    process.exit(1);
}