const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user',
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    field: 'is_verified',
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING(255),
    field: 'verification_token'
  },
  verificationTokenExpire: {
    type: DataTypes.DATE,
    field: 'verification_token_expire'
  },
  verificationCode: {
    type: DataTypes.STRING(6),
    field: 'verification_code'
  },
  verificationExpires: {
    type: DataTypes.DATE,
    field: 'verification_expires'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = User;