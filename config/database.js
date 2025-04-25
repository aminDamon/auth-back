module.exports = {
    development: {
        username: 'postgres',
        password: 'postgres',
        database: 'node_auth',
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: console.log
    },
    production: {
        username: 'root',
        password: 'mS5Vxl7hQDAyIHHvKwLHMC1c',
        database: 'safenetftpsafescap_ir_',
        host: 'safescap',
        port: 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
}; 