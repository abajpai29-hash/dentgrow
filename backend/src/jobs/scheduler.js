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

// Only send messages between 9:00am and 7:00pm IST
function isWithinSendingWindow() {
  const istHour = parseInt(
    new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' })
  );
  return istHour >= 9 && istHour < 19;
}

function startScheduler() {
  console.log('[Scheduler] Starting DentGrow automation engine...');

  // Every 30 minutes — main automation loop (9am–7pm IST only)
  cron.schedule('*/30 * * * *', async () => {
    if (!isWithinSendingWindow()) {
      console.log('[Scheduler] Outside sending window (9am–7pm IST), skipping');
      return;
    }
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
