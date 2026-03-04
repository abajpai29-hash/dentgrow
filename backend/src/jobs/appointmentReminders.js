const supabase = require('../config/supabase');
const { sendWhatsApp, alreadySent } = require('../services/whatsapp');

function formatTime(datetime) {
  return new Date(datetime).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

// Run every 30 mins — send 24hr and 2hr reminders
async function runAppointmentReminders() {
  const now = new Date();

  // ── 24-hour window: appointments between 23.5hrs and 24.5hrs from now
  const window24Start = new Date(now.getTime() + 23.5 * 60 * 60 * 1000).toISOString();
  const window24End = new Date(now.getTime() + 24.5 * 60 * 60 * 1000).toISOString();

  // ── 2-hour window: appointments between 1.75hrs and 2.5hrs from now
  const window2Start = new Date(now.getTime() + 1.75 * 60 * 60 * 1000).toISOString();
  const window2End = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString();

  const { data: upcoming } = await supabase
    .from('appointments')
    .select(`
      id, clinic_id, datetime, treatment_type,
      patients (id, name, mobile),
      clinics (name, booking_link)
    `)
    .in('status', ['scheduled', 'confirmed'])
    .or(`datetime.gte.${window24Start},datetime.lte.${window24End},datetime.gte.${window2Start},datetime.lte.${window2End}`);

  if (!upcoming?.length) return;

  for (const appt of upcoming) {
    const apptTime = new Date(appt.datetime).getTime();
    const hoursUntil = (apptTime - now.getTime()) / (60 * 60 * 1000);
    const patient = appt.patients;
    const clinic = appt.clinics;

    if (!patient?.mobile) continue;

    const vars = {
      name: patient.name,
      mobile: patient.mobile,
      treatment: appt.treatment_type,
      clinic: clinic.name,
      time: formatTime(appt.datetime),
      bookingLink: clinic.booking_link || '',
    };

    if (hoursUntil >= 23.5 && hoursUntil <= 24.5) {
      const sent = await alreadySent(appt.clinic_id, patient.id, 'appointment_reminder_24h', 1);
      if (!sent) {
        await sendWhatsApp({
          clinicId: appt.clinic_id,
          patientId: patient.id,
          appointmentId: appt.id,
          type: 'appointment_reminder_24h',
          vars,
        });
      }
    }

    if (hoursUntil >= 1.75 && hoursUntil <= 2.5) {
      const sent = await alreadySent(appt.clinic_id, patient.id, 'appointment_reminder_2h', 1);
      if (!sent) {
        await sendWhatsApp({
          clinicId: appt.clinic_id,
          patientId: patient.id,
          appointmentId: appt.id,
          type: 'appointment_reminder_2h',
          vars,
        });
      }
    }
  }
}

module.exports = { runAppointmentReminders };
