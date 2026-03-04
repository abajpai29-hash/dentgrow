require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { startScheduler } = require('./jobs/scheduler');

// Routes
const authRoutes = require('./routes/auth');
const clinicRoutes = require('./routes/clinics');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const messageRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');
// Phase 2 stubs
const reviewRoutes = require('./routes/reviews');
const contentRoutes = require('./routes/content');
const campaignRoutes = require('./routes/campaigns');
// Phase 3 stubs
const reportRoutes = require('./routes/reports');
const adsRoutes = require('./routes/ads');
const billingRoutes = require('./routes/billing');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DentGrow API', timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
// Phase 2
app.use('/api/reviews', reviewRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/campaigns', campaignRoutes);
// Phase 3
app.use('/api/reports', reportRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/billing', billingRoutes);

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nDentGrow API running on http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  if (!process.env.WHATSAPP_TOKEN) {
    console.log('WhatsApp: MOCK MODE (messages logged to console)');
  }
  if (!process.env.RESEND_API_KEY) {
    console.log('Email: MOCK MODE (emails logged to console)');
  }

  // Start automation engine
  startScheduler();
});

module.exports = app;
