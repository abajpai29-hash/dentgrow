const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Resolve clinic_id based on user role
function getClinicId(req) {
  if (req.user.role === 'superadmin') return req.query.clinic_id;
  return req.user.clinic_id;
}

// GET /api/patients — list patients (tenant-scoped)
router.get('/', authenticate, async (req, res) => {
  const clinic_id = getClinicId(req);
  if (!clinic_id) return res.status(400).json({ error: 'clinic_id required' });

  const search = req.query.search;
  let query = supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinic_id)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,mobile.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/patients/:id — single patient with appointment history
router.get('/:id', authenticate, async (req, res) => {
  const clinic_id = getClinicId(req);

  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !patient) return res.status(404).json({ error: 'Patient not found' });

  // Enforce tenant isolation
  if (req.user.role !== 'superadmin' && patient.clinic_id !== clinic_id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patient.id)
    .order('datetime', { ascending: false });

  res.json({ ...patient, appointments: appointments || [] });
});

// POST /api/patients — add new patient
router.post('/', authenticate, async (req, res) => {
  const clinic_id = req.user.role === 'superadmin' ? req.body.clinic_id : req.user.clinic_id;
  const { name, mobile, age, gender, notes } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ error: 'name and mobile are required' });
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({ clinic_id, name, mobile, age, gender, notes })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/patients/:id — update patient
router.patch('/:id', authenticate, async (req, res) => {
  const allowed = ['name', 'mobile', 'age', 'gender', 'notes'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const { data: existing } = await supabase
    .from('patients')
    .select('clinic_id')
    .eq('id', req.params.id)
    .single();

  if (!existing) return res.status(404).json({ error: 'Patient not found' });
  if (req.user.role !== 'superadmin' && existing.clinic_id !== req.user.clinic_id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
