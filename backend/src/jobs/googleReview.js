// Phase 2 — Google Review Automation
// Triggered 48hrs after post-treatment follow-up sent, for Growth/Partner clinics

async function runGoogleReviewRequests() {
  console.log('[Google Review] Phase 2 feature — not yet active');
  // TODO Phase 2: Query clinics with plan=growth|partner
  // Find appointments where follow-up was sent 47-49 hours ago
  // Check patient hasn't received review request in 90 days
  // Send review request WhatsApp with clinic's google_review_link
}

module.exports = { runGoogleReviewRequests };
