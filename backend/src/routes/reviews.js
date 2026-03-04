const express = require('express');
const router = express.Router();

// Phase 2 — Google Review Automation
router.get('/', (req, res) => {
  res.json({ status: 'coming_soon', phase: 2, feature: 'Google Review Automation' });
});

module.exports = router;
