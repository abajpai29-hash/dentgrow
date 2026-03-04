const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function getClinicId(req) {
  if (req.user.role === 'superadmin') return req.query.clinic_id;
  return req.user.clinic_id;
}

// GET /api/appointments — list appointments (today + upcoming by default)
router.get('/', authenticate, async (req, res) => {
  const clinic_id = getClinicId(req);
  if (!clinic_id) return res.status(400).json({ error: 'clinic_id required' });

  const { filter, date } = req.query; // filter: today|upcoming|all

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients (id, name, mobile, age, gender)
    `)
    .eq('clinic_id', clinic_id)
    .order('datetime', { ascending: true });

  const now = new Date();
  if (filter === 'today' || !filter) {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    query = query.gte('datetime', todayStart).lt('datetime', todayEnd);
  } else if (filter === 'upcoming') {
    query = query.gte('datetime', now.toISOString()).in('status', ['scheduled', 'confirmed']);
  } else if (filter === 'date' && date) {
    const dayStart = new Date(date).toISOString();
    const dayEnd = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('datetime', dayStart).lt('datetime', dayEnd);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/appointments — create appointment
router.post('/', authenticate, async (req, res) => {
  const clinic_id = req.user.role === 'superadmin' ? req.body.clinic_id : req.user.clinic_id;
  const { patient_id, datetime, treatment_type, treatment_notes } = req.body;

  if (!patient_id || !datetime || !treatment_type) {
    return res.status(400).json({ error: 'patient_id, datetime, and treatment_type are required' });
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({ clinic_id, patient_id, datetime, treatment_type, treatment_notes, status: 'scheduled' })
    .select(`*, patients (id, name, mobile)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/appointments/:id/status — confirm / complete / no-show
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status, treatment_notes } = req.body;
  const validStatuses = ['scheduled', 'confirmed', 'completed', 'no-show'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  // Fetch appointment to verify tenant
  const { data: existing } = await supabase
    .from('appointments')
    .select('clinic_id, status')
    .eq('id', req.params.id)
    .single();

  if (!existing) return res.status(404).json({ error: 'Appointment not found' });
  if (req.user.role !== 'superadmin' && existing.clinic_id !== req.user.clinic_id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updates = { status };
  if (status === 'completed') updates.completed_at = new Date().toISOString();
  if (treatment_notes) updates.treatment_notes = treatment_notes;

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', req.params.id)
    .select(`*, patients (id, name, mobile)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/appointments/:id — update appointment details
router.patch('/:id', authenticate, async (req, res) => {
  const allowed = ['datetime', 'treatment_type', 'treatment_notes'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const { data: existing } = await supabase
    .from('appointments')
    .select('clinic_id')
    .eq('id', req.params.id)
    .single();

  if (!existing) return res.status(404).json({ error: 'Appointment not found' });
  if (req.user.role !== 'superadmin' && existing.clinic_id !== req.user.clinic_id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
