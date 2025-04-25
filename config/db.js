const { Sequelize } = require('sequelize');
const config = require('./database');

// Always use production config
const dbConfig = config.production;

console.log('Using production database configuration');
console.log(`Connecting to host: ${dbConfig.host}:${dbConfig.port}`);

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        dialectOptions: {
            ssl: false,  // Disable SSL for private network
            connectTimeout: 60000,
            keepAlive: true
        },
        retry: {
            max: 3,
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
                /TimeoutError/
            ]
        }
    }
);

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

module.exports = { sequelize };