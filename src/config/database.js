const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,   // Important for Railway
        },
        connectTimeout: 60000,
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 60000,      // Increased for better stability
        idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
    },
});

// Optional: Test Connection
sequelize.authenticate()
    .then(() => {
        console.log('✅ PostgreSQL Database Connected Successfully');
    })
    .catch((err) => {
        console.error('❌ Unable to connect to PostgreSQL:', err.message);
    });

module.exports = sequelize;
