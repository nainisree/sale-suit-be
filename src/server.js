const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const sequelize = require('./config/database');
const routes = require('./routes');

// Import models to ensure they are registered with Sequelize
require('./models');

const app = express();
const PORT = process.env.PORT || 8000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────
// CORS — allow frontend origin with credentials
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// ─── ROUTES ──────────────────────────────────────────────────────────
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sale Suit API',
    version: '1.0.0',
    description: 'Backend API for the Sale Suit Business Marketplace',
  });
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ detail: [`Route ${req.method} ${req.originalUrl} not found.`] });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    detail: [err.message || 'Internal Server Error'],
  });
});

// ─── START SERVER ────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synced.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Sale Suit API Server running on http://localhost:${PORT}`);
      console.log(`📋 API Base: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
