const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/clinics — all clinics with stats (superadmin only)
router.get('/', authenticate, requireSuperAdmin, async (req, res) => {
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Attach stats for each clinic
  const clinicsWithStats = await Promise.all(
    clinics.map(async (clinic) => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [apptResult, noShowResult, msgResult, patientResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', clinic.id)
          .gte('datetime', monthStart),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', clinic.id)
          .eq('status', 'no-show')
          .gte('datetime', monthStart),
        supabase
          .from('messages_log')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', clinic.id)
          .gte('sent_at', monthStart),
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', clinic.id),
      ]);

      const apptCount = apptResult.count || 0;
      const noShowCount = noShowResult.count || 0;
      const noShowRate = apptCount > 0 ? Math.round((noShowCount / apptCount) * 100) : 0;

      // Traffic light: red=churned/paused, yellow=noshow>20% or msg_failures, green=all good
      let health = 'green';
      if (clinic.status === 'churned' || clinic.status === 'paused') health = 'red';
      else if (noShowRate > 20) health = 'yellow';

      return {
        ...clinic,
        stats: {
          appointments_this_month: apptCount,
          no_show_count: noShowCount,
          no_show_rate: noShowRate,
          messages_this_month: msgResult.count || 0,
          total_patients: patientResult.count || 0,
        },
        health,
      };
    })
  );

  res.json(clinicsWithStats);
});

// GET /api/clinics/mrr — revenue overview (superadmin only)
router.get('/mrr', authenticate, requireSuperAdmin, async (req, res) => {
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('plan, amount, status')
    .eq('status', 'active');

  if (error) return res.status(500).json({ error: error.message });

  const mrr = subs.reduce((sum, s) => sum + s.amount, 0);
  const { count: totalClinics } = await supabase
    .from('clinics')
    .select('id', { count: 'exact', head: true });
  const { count: churnedClinics } = await supabase
    .from('clinics')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'churned');

  res.json({ mrr, total_clinics: totalClinics, churned: churnedClinics });
});

// GET /api/clinics/:id — single clinic detail
router.get('/:id', authenticate, requireSuperAdmin, async (req, res) => {
  const { data: clinic, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !clinic) return res.status(404).json({ error: 'Clinic not found' });
  res.json(clinic);
});

// POST /api/clinics — onboard new clinic
router.post('/', authenticate, requireSuperAdmin, async (req, res) => {
  const { name, owner_name, owner_mobile, email, plan, receptionist_email, receptionist_password } = req.body;

  if (!name || !owner_name || !owner_mobile || !email || !plan) {
    return res.status(400).json({ error: 'name, owner_name, owner_mobile, email, plan are required' });
  }

  const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .insert({ name, owner_name, owner_mobile, email, plan, status: 'trial', trial_ends_at: trialEndsAt })
    .select()
    .single();

  if (clinicError) return res.status(500).json({ error: clinicError.message });

  // Create subscription record
  const planPrices = { starter: 5999, growth: 9999, partner: 18999 };
  await supabase.from('subscriptions').insert({
    clinic_id: clinic.id,
    plan,
    amount: planPrices[plan],
    status: 'trial',
  });

  // Create receptionist account if provided
  if (receptionist_email && receptionist_password) {
    const hash = await bcrypt.hash(receptionist_password, 10);
    await supabase.from('staff').insert({
      clinic_id: clinic.id,
      name: 'Receptionist',
      role: 'receptionist',
      email: receptionist_email,
      password_hash: hash,
    });
  }

  res.status(201).json(clinic);
});

// PATCH /api/clinics/:id — update clinic status or plan
router.patch('/:id', authenticate, requireSuperAdmin, async (req, res) => {
  const allowed = ['status', 'plan', 'google_review_link', 'booking_link', 'instagram_handle',
    'whatsapp_token', 'phone_number_id', 'owner_name', 'owner_mobile'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const { data, error } = await supabase
    .from('clinics')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
