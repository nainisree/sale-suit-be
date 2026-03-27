const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full name is required.' },
      len: { args: [2, 100], msg: 'Full name must be between 2 and 100 characters.' },
    },
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: { msg: 'This phone number is already registered.' },
    validate: {
      notEmpty: { msg: 'Phone number is required.' },
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: { msg: 'This email is already registered.' },
    validate: {
      isEmail: { msg: 'Please provide a valid email address.' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required.' },
      len: { args: [6, 255], msg: 'Password must be at least 6 characters.' },
    },
  },
  role: {
    type: DataTypes.ENUM('end_user', 'mediator', 'field_person', 'customer_care', 'admin'),
    defaultValue: 'end_user',
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  kyc_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Instance method to compare passwords
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to return safe user object (no password)
User.prototype.toSafeObject = function () {
  const { password, ...safeUser } = this.toJSON();
  return safeUser;
};

module.exports = User;
