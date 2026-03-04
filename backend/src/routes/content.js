const express = require('express');
const router = express.Router();

// Phase 2 — Instagram Content Calendar
router.get('/', (req, res) => {
  res.json({ status: 'coming_soon', phase: 2, feature: 'Instagram Content Calendar' });
});

module.exports = router;
