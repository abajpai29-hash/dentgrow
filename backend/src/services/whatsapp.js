const axios = require('axios');
const supabase = require('../config/supabase');

const MOCK_MODE = !process.env.WHATSAPP_TOKEN;

// ============================================================
// Message Templates
// ============================================================
function buildMessage(type, vars) {
  const { name, treatment, clinic, time, bookingLink } = vars;

  const templates = {
    appointment_reminder_24h:
      `Hi ${name} 😊 Reminder: your ${treatment} appointment at ${clinic} is tomorrow at ${time}. Reply YES to confirm or call us to reschedule.`,
    appointment_reminder_2h:
      `Hi ${name}, see you in 2 hours at ${clinic} for your ${treatment}! 🦷`,
    post_treatment_RCT:
      `Hi ${name}, hope you're recovering well after your root canal at ${clinic}. Any pain or swelling? Don't hesitate to call us 😊`,
    post_treatment_Crown:
      `Hi ${name}, hope you're recovering well after your root canal at ${clinic}. Any pain or swelling? Don't hesitate to call us 😊`,
    post_treatment_Extraction:
      `Hi ${name}, remember — soft foods for 2-3 days and no smoking. Any concerns, call us anytime 😊 — ${clinic}`,
    post_treatment_Braces:
      `Hi ${name}, slight discomfort in the first few days is totally normal 😊 See you at your next adjustment! — ${clinic}`,
    post_treatment_general:
      `Hi ${name}, hope your visit went well! Any concerns, we're just a WhatsApp away 😊 — ${clinic}`,
    reengagement:
      `Hi ${name} 😊 It's been 6 months since your last visit at ${clinic}! A quick checkup can prevent bigger problems later. Book your appointment: ${bookingLink}`,
    google_review:
      `Hi ${name}, so glad you visited us at ${clinic}! If you had a good experience, a quick Google review would mean the world to us 🙏 Takes 30 seconds: ${bookingLink}`,
    trial_expiry:
      `Hi, your DentGrow trial for ${clinic} ends in 3 days. Reply to upgrade and keep your automation running 💪`,
    payment_failed:
      `Hi, there was an issue with your DentGrow payment for ${clinic}. Please update your payment details within 3 days to avoid service pause.`,
  };

  return templates[type] || templates['post_treatment_general'];
}

// ============================================================
// Send via Meta Cloud API
// ============================================================
async function sendViaAPI(phoneNumberId, token, to, message) {
  const response = await axios.post(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: `91${to}`, // India prefix
      type: 'text',
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data?.messages?.[0]?.id;
}

// ============================================================
// Main send function — with retry + logging
// ============================================================
async function sendWhatsApp({ clinicId, patientId, appointmentId, type, vars, phoneOverride }) {
  const message = buildMessage(type, vars);
  const to = phoneOverride || vars.mobile;

  // Log as pending first
  const { data: logEntry } = await supabase
    .from('messages_log')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId || null,
      appointment_id: appointmentId || null,
      type,
      message_template: type,
      message_body: message,
      delivery_status: 'pending',
    })
    .select()
    .single();

  if (MOCK_MODE) {
    console.log('\n[WhatsApp MOCK] ─────────────────────────────');
    console.log(`To: ${to}`);
    console.log(`Type: ${type}`);
    console.log(`Message: ${message}`);
    console.log('──────────────────────────────────────────\n');

    await supabase
      .from('messages_log')
      .update({ delivery_status: 'sent' })
      .eq('id', logEntry.id);

    return { success: true, mock: true };
  }

  // Get clinic WhatsApp credentials
  const { data: clinic } = await supabase
    .from('clinics')
    .select('whatsapp_token, phone_number_id')
    .eq('id', clinicId)
    .single();

  const token = clinic?.whatsapp_token || process.env.WHATSAPP_TOKEN;
  const phoneNumberId = clinic?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    await supabase
      .from('messages_log')
      .update({ delivery_status: 'failed' })
      .eq('id', logEntry.id);
    return { success: false, error: 'No WhatsApp credentials' };
  }

  // Retry up to 3 times
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const waMessageId = await sendViaAPI(phoneNumberId, token, to, message);
      await supabase
        .from('messages_log')
        .update({ delivery_status: 'sent', wa_message_id: waMessageId, retry_count: attempt })
        .eq('id', logEntry.id);
      return { success: true, wa_message_id: waMessageId };
    } catch (err) {
      lastError = err;
      if (attempt < 2) await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
    }
  }

  await supabase
    .from('messages_log')
    .update({ delivery_status: 'failed', retry_count: 3 })
    .eq('id', logEntry.id);

  console.error(`[WhatsApp] Failed to send ${type} to ${to}:`, lastError?.message);
  return { success: false, error: lastError?.message };
}

// ============================================================
// Deduplication check — has this message type been sent in last N days?
// ============================================================
async function alreadySent(clinicId, patientId, type, withinDays = 7) {
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('messages_log')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .eq('type', type)
    .neq('delivery_status', 'failed')
    .gte('sent_at', since);

  return count > 0;
}

module.exports = { sendWhatsApp, alreadySent, buildMessage };
