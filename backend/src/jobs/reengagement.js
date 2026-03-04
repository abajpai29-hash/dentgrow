const supabase = require('../config/supabase');
const { sendWhatsApp, alreadySent } = require('../services/whatsapp');

// Run every 30 mins — re-engage patients with no visit in 180 days
async function runReengagement() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();

  // Find all active clinics
  const { data: clinics } = await supabase
    .from('clinics')
    .select('id, name, booking_link')
    .in('status', ['active', 'trial']);

  if (!clinics?.length) return;

  for (const clinic of clinics) {
    // Get all patients for this clinic
    const { data: patients } = await supabase
      .from('patients')
      .select('id, name, mobile')
      .eq('clinic_id', clinic.id);

    if (!patients?.length) continue;

    for (const patient of patients) {
      if (!patient.mobile) continue;

      // Check if already sent reengagement within 7 days
      const recentlySent = await alreadySent(clinic.id, patient.id, 'reengagement', 7);
      if (recentlySent) continue;

      // Check their last appointment
      const { data: lastAppt } = await supabase
        .from('appointments')
        .select('datetime, status')
        .eq('clinic_id', clinic.id)
        .eq('patient_id', patient.id)
        .in('status', ['completed', 'confirmed', 'scheduled'])
        .order('datetime', { ascending: false })
        .limit(1)
        .single();

      // If no appointment or last was > 180 days ago
      if (!lastAppt || new Date(lastAppt.datetime) < new Date(sixMonthsAgo)) {
        await sendWhatsApp({
          clinicId: clinic.id,
          patientId: patient.id,
          type: 'reengagement',
          vars: {
            name: patient.name,
            mobile: patient.mobile,
            clinic: clinic.name,
            bookingLink: clinic.booking_link || 'Please call us to book',
          },
        });
      }
    }
  }
}

module.exports = { runReengagement };
