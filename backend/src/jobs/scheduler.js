const cron = require('node-cron');
const { runAppointmentReminders } = require('./appointmentReminders');
const { runPostTreatmentFollowup } = require('./postTreatmentFollowup');
const { runReengagement } = require('./reengagement');
const { runNoShowDetection } = require('./noShowDetection');
const { runGoogleReviewRequests } = require('./googleReview');

async function safeRun(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`[Scheduler] ${name} failed:`, err.message);
  }
}

function startScheduler() {
  console.log('[Scheduler] Starting DentGrow automation engine...');

  // Every 30 minutes — main automation loop
  cron.schedule('*/30 * * * *', async () => {
    console.log(`[Scheduler] Running jobs at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    await safeRun('AppointmentReminders', runAppointmentReminders);
    await safeRun('PostTreatmentFollowup', runPostTreatmentFollowup);
    await safeRun('GoogleReview', runGoogleReviewRequests);
  });

  // Re-engagement runs once daily at 10am IST (4:30am UTC)
  cron.schedule('30 4 * * *', async () => {
    console.log('[Scheduler] Running daily re-engagement job');
    await safeRun('Reengagement', runReengagement);
  });

  // No-show detection runs at 10pm IST (4:30pm UTC)
  cron.schedule('30 16 * * *', async () => {
    console.log('[Scheduler] Running end-of-day no-show detection');
    await safeRun('NoShowDetection', runNoShowDetection);
  });

  console.log('[Scheduler] All cron jobs scheduled');
}

module.exports = { startScheduler };
