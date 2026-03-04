const supabase = require('../config/supabase');

// Run once at end of day (10pm IST) — flag unresolved appointments
async function runNoShowDetection() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // Find scheduled appointments from today that passed more than 1 hour ago
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  const { data: missed } = await supabase
    .from('appointments')
    .select('id, clinic_id, datetime, patients(name)')
    .eq('status', 'scheduled')
    .gte('datetime', todayStart)
    .lte('datetime', oneHourAgo);

  if (!missed?.length) return;

  console.log(`[NoShow Detection] Found ${missed.length} potentially missed appointments`);

  // We don't auto-mark as no-show — we flag them for the clinic to review
  // In a future version, we could push a notification to the clinic portal
  for (const appt of missed) {
    console.log(`  - ${appt.patients?.name} at ${new Date(appt.datetime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (clinic: ${appt.clinic_id})`);
  }

  // Return the list for the dashboard to surface
  return missed;
}

module.exports = { runNoShowDetection };
