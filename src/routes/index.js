const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');

// Mount routes
router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Sale Suit API is running.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
