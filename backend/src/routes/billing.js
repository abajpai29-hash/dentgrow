const express = require('express');
const router = express.Router();

// Phase 3 — Razorpay Subscription Billing
router.get('/', (req, res) => {
  res.json({ status: 'coming_soon', phase: 3, feature: 'Razorpay Subscription Billing' });
});

// Webhook placeholder
router.post('/webhook', (req, res) => {
  // TODO Phase 3: verify Razorpay signature, handle payment.captured, subscription.charged, payment.failed
  console.log('[Billing] Webhook received (Phase 3 not yet active)');
  res.json({ received: true });
});

module.exports = router;
