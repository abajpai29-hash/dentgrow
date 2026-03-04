const express = require('express');
const router = express.Router();

// Phase 2 — Offer Broadcast Campaigns
router.get('/', (req, res) => {
  res.json({ status: 'coming_soon', phase: 2, feature: 'WhatsApp Broadcast Campaigns' });
});

module.exports = router;
