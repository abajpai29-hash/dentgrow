const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/:clinicId — dashboard stats for a clinic
router.get('/:clinicId', authenticate, async (req, res) => {
  const { clinicId } = req.params;

  // Tenant check
  if (req.user.role !== 'superadmin' && req.user.clinic_id !== clinicId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = monthStart;
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();

  const [
    apptThisMonth,
    apptLastMonth,
    noShowThisMonth,
    msgsThisMonth,
    msgsDelivered,
    totalPatients,
    newPatientsThisMonth,
    returningPatients,
  ] = await Promise.all([
    supabase.from('appointments').select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId).gte('datetime', monthStart),
    supabase.from('appointments').select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId).gte('datetime', lastMonthStart).lt('datetime', lastMonthEnd),
    supabase.from('appointments').select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId).eq('status', 'no-show').gte('datetime', monthStart),
    supabase.from('messages_log').select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId).gte('sent_at', monthStart),
    supabase.from('messages_log').select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId).eq('delivery_status', 'delivered').gte('sent_at', monthStart),
    supabase.from('patients').select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId),
    supabase.from('patients').select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId).gte('created_at', monthStart),
    // Patients who had appointments in last 6 months (returned)
    supabase.from('appointments').select('patient_id')
      .eq('clinic_id', clinicId).eq('status', 'completed').gte('datetime', sixMonthsAgo),
  ]);

  const apptCount = apptThisMonth.count || 0;
  const noShowCount = noShowThisMonth.count || 0;
  const msgCount = msgsThisMonth.count || 0;
  const deliveredCount = msgsDelivered.count || 0;

  // Unique returning patients
  const uniqueReturning = new Set(
    (returningPatients.data || []).map((a) => a.patient_id)
  ).size;

  const retentionRate = totalPatients.count > 0
    ? Math.round((uniqueReturning / totalPatients.count) * 100)
    : 0;

  res.json({
    appointments: {
      this_month: apptCount,
      last_month: apptLastMonth.count || 0,
      change_pct: apptLastMonth.count > 0
        ? Math.round(((apptCount - apptLastMonth.count) / apptLastMonth.count) * 100)
        : 0,
    },
    no_show: {
      count: noShowCount,
      rate: apptCount > 0 ? Math.round((noShowCount / apptCount) * 100) : 0,
    },
    messages: {
      sent: msgCount,
      delivered: deliveredCount,
      delivery_rate: msgCount > 0 ? Math.round((deliveredCount / msgCount) * 100) : 0,
    },
    patients: {
      total: totalPatients.count || 0,
      new_this_month: newPatientsThisMonth.count || 0,
      returning_6mo: uniqueReturning,
      retention_rate: retentionRate,
    },
  });
});

module.exports = router;
