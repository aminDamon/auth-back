const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Log = sequelize.define('Log', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false,
        field: 'ip_address'
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'timestamp'
    },
    method: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'method'
    },
    path: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'path'
    },
    http_version: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'http_version'
    },
    status_code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status_code'
    },
    response_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'response_size'
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent'
    }
}, {
    tableName: 'logs',
    timestamps: true,
    underscored: true
});

module.exports = Log;