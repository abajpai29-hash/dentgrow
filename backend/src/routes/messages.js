const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages — messages log (tenant-scoped, superadmin sees all)
router.get('/', authenticate, async (req, res) => {
  const { clinic_id: queryClinicId, status, type, limit = 50, offset = 0 } = req.query;

  let query = supabase
    .from('messages_log')
    .select(`
      *,
      patients (id, name, mobile),
      clinics (id, name)
    `)
    .order('sent_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  // Tenant scoping
  if (req.user.role !== 'superadmin') {
    query = query.eq('clinic_id', req.user.clinic_id);
  } else if (queryClinicId) {
    query = query.eq('clinic_id', queryClinicId);
  }

  if (status) query = query.eq('delivery_status', status);
  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
