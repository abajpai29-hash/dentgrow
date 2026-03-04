const express = require('express');
const router = express.Router();

// Phase 3 — Monthly PDF Reports
router.get('/', (req, res) => {
  res.json({ status: 'coming_soon', phase: 3, feature: 'Monthly PDF Growth Reports' });
});

module.exports = router;
