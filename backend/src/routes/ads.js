const express = require('express');
const router = express.Router();

// Phase 3 — Ads Performance Tracker
router.get('/', (req, res) => {
  res.json({ status: 'coming_soon', phase: 3, feature: 'Ads Performance Tracker' });
});

module.exports = router;
