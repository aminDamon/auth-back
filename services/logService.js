const fs = require('fs');
const path = require('path');

class LogService {
    constructor() {
        this.logPath = path.join(process.cwd(), 'logs.txt');
        this.errorStatusCodes = [
            '304', '400', '401', '403', '404', '405', '406', '407', '408', '409',
            '410', '411', '412', '413', '414', '415', '416', '417', '500', '501',
            '502', '503', '504', '505'
        ];
    }

    parseLogLine(log) {
        const parts = log.trim().split('\t');
        if (parts.length < 3) return null;

        const ip = parts[0];
        const dateTime = parts[1];
        const dataPart = parts[2];

        const statusMatch = dataPart.match(/" (\d{3}) /);
        const serialMatch = dataPart.match(/serial_number=([^&\s]+)/);
        const pathMatch = dataPart.match(/^(\S+)\s+([^"]+)/);

        return {
            ip,
            timestamp: dateTime,
            date: dateTime.split(' ')[0],
            status: statusMatch ? statusMatch[1] : '',
            serial: serialMatch ? serialMatch[1] : '',
            path: pathMatch ? pathMatch[2] : '',
            raw: log
        };
    }

    async getLogs(filters = {}) {
        const {
            ip,
            serial,
            startDate,
            endDate,
            statusCodes,
            filterType = 'all',
            path
        } = filters;

        try {
            const content = await fs.promises.readFile(this.logPath, 'utf8');
            let logs = content.trim().split('\n')
                .map(log => this.parseLogLine(log))
                .filter(log => log !== null);

            // Filter by date
            if (startDate || endDate) {
                logs = this.filterByDate(logs, startDate, endDate);
            }

            // Filter by IP
            if (ip) {
                logs = logs.filter(log => log.ip === ip);
            }

            // Filter by serial
            if (serial) {
                logs = logs.filter(log => log.serial === serial);
            }

            // Filter by path
            if (path) {
                logs = logs.filter(log => log.path.includes(path));
            }

            // Filter by status codes
            logs = this.filterByStatus(logs, filterType, statusCodes);

            return logs;
        } catch (error) {
            throw new Error(`Error reading logs: ${error.message}`);
        }
    }

    filterByDate(logs, startDate, endDate) {
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

    filterByStatus(logs, filterType, statusCodes) {
        if (filterType === 'all') {
            return logs; // Return all logs
        } else if (filterType === 'error') {
            return logs.filter(log => this.errorStatusCodes.includes(log.status));
        } else if (filterType === 'success') {
            return logs.filter(log => !this.errorStatusCodes.includes(log.status));
        } else if (filterType === 'specific' && statusCodes) {
            const codes = statusCodes.split(',').map(code => code.trim());
            return logs.filter(log => codes.includes(log.status));
        }
        return logs;
    }

    async getStatusCodeStats() {
        const logs = await this.getLogs();
        const stats = {};
        
        logs.forEach(log => {
            if (!stats[log.status]) {
                stats[log.status] = 0;
            }
            stats[log.status]++;
        });

        return stats;
    }

    async getUniqueIPs() {
        const logs = await this.getLogs();
        return [...new Set(logs.map(log => log.ip))];
    }
}

module.exports = new LogService();