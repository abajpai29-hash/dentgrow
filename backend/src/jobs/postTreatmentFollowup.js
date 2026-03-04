const supabase = require('../config/supabase');
const { sendWhatsApp, alreadySent } = require('../services/whatsapp');

// Run every 30 mins — send follow-up 24hrs after appointment marked Complete
async function runPostTreatmentFollowup() {
  const now = new Date();

  // Appointments completed 23-25 hours ago
  const windowStart = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString();

  const { data: completed } = await supabase
    .from('appointments')
    .select(`
      id, clinic_id, treatment_type, completed_at,
      patients (id, name, mobile),
      clinics (name, booking_link)
    `)
    .eq('status', 'completed')
    .gte('completed_at', windowStart)
    .lte('completed_at', windowEnd);

  if (!completed?.length) return;

  for (const appt of completed) {
    const patient = appt.patients;
    const clinic = appt.clinics;
    if (!patient?.mobile) continue;

    const alreadySentFollowup = await alreadySent(appt.clinic_id, patient.id, `post_treatment_${appt.treatment_type}`, 3);
    if (alreadySentFollowup) continue;

    // Pick the right template based on treatment
    let type;
    if (['RCT', 'Crown'].includes(appt.treatment_type)) type = `post_treatment_RCT`;
    else if (appt.treatment_type === 'Extraction') type = 'post_treatment_Extraction';
    else if (appt.treatment_type === 'Braces') type = 'post_treatment_Braces';
    else type = 'post_treatment_general';

    await sendWhatsApp({
      clinicId: appt.clinic_id,
      patientId: patient.id,
      appointmentId: appt.id,
      type,
      vars: {
        name: patient.name,
        mobile: patient.mobile,
        treatment: appt.treatment_type,
        clinic: clinic.name,
        bookingLink: clinic.booking_link || '',
      },
    });
  }
}

module.exports = { runPostTreatmentFollowup };
