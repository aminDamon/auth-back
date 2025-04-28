#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { parse } = require('date-fns');

const args = require('yargs')
    .option('ip', {
        alias: 'i',
        describe: 'Filter by IP address',
        type: 'string'
    })
    .option('serial', {
        alias: 's',
        describe: 'Filter by serial number',
        type: 'string'
    })
    .option('startDate', {
        describe: 'Start date for filtering (YYYY-MM-DD)',
        type: 'string'
    })
    .option('endDate', {
        describe: 'End date for filtering (YYYY-MM-DD)',
        type: 'string'
    })
    .argv;


const logFilePath = path.join(__dirname, 'your-log-file.log');


const logs = fs.readFileSync(logFilePath, 'utf-8').split('\n');


const filteredLogs = logs.filter(line => {
    if (!line.trim()) return false;

    const parts = line.split('\t');
    if (parts.length < 2) return false;

    const ip = parts[0];
    const dateTime = parts[1];
    const datePart = dateTime.split(' ')[0];

    
    if (args.ip && ip !== args.ip) return false;

    
    if (args.serial && !line.includes(`serial_number=${args.serial}`)) return false;

    
    if (args.startDate || args.endDate) {
        const logDate = parse(datePart, 'yyyy-MM-dd', new Date());

        if (args.startDate) {
            const startDate = parse(args.startDate, 'yyyy-MM-dd', new Date());
            if (logDate < startDate) return false;
        }

        if (args.endDate) {
            const endDate = parse(args.endDate, 'yyyy-MM-dd', new Date());
            if (logDate > endDate) return false;
        }
    }

    return true;
});


console.log(filteredLogs.join('\n'));