# CLAUDE.md — DentGrow

> Read this file at the start of every single session without exception.
> This is the single source of truth for what DentGrow is, every decision made, and how to build it.
> When in doubt about anything — check here first. If it's not here, ask before assuming.

---

## What Is DentGrow?

DentGrow is a **done-for-you growth platform for independent dental clinics in India.**

It is NOT a clinic management tool. No billing, no treatment records, no clinical workflows.

It IS a **silent growth partner** — fully automated, runs in the background, so the clinic owner just does dentistry. We handle everything that gets them more patients, retains existing ones, and builds their online presence.

Clinics pay a monthly retainer. We run everything on autopilot.

---

## The Core Insight

Most independent dental clinics in India lose patients not because of bad dentistry — but because of zero systems:

- No follow-up after treatment → patients forget to return
- No appointment reminders → high no-show rates
- No Google reviews despite happy patients → weak online credibility
- No social media presence → invisible to new patients
- No visibility into their own growth → owner has no idea what's working

**Clinic owners are busy dentists, not marketers. DentGrow fills that gap entirely.**

The biggest revenue leaks are not from lack of new patients — they're inside the existing patient base. Unconverted treatment plans, lapsed patients, no-shows, zero review systems. This is where we start.

---

## Target Customer

- Small to mid-size **independent** dental clinics in India
- Owner-doctors who are too busy to do their own marketing
- Clinics that have patients but poor retention and weak online presence
- Includes clinics with **zero digital presence** (no Google listing, no WhatsApp Business, patients in a register) — these are actually our best customers because the transformation is dramatic
- NOT dental chains or large multi-location groups (for now)

---

## Two Types of Clinics We Onboard

**Type A — Digitally Dark**
No Google Business Profile, no WhatsApp Business, patients stored in register or Excel. Onboarding takes 3-4 hours of one-time setup work — create WhatsApp Business, claim Google profile, import patient data, activate automations. High effort upfront, zero ongoing effort after.

**Type B — Partially Digital**
Has some digital presence but unoptimized. WhatsApp Business exists, maybe a Google listing. Onboarding takes 1-2 hours — audit, optimize, connect to DentGrow, activate automations.

**Both types use the identical automation engine once set up. The only difference is onboarding effort.**

---

## Business Model

Monthly retainer subscription. Three tiers:

| Plan | Price | What's Included |
|------|-------|-----------------|
| Starter | ₹5,999/mo | Patient management + WhatsApp reminders + full follow-up sequences + review automation |
| Growth | ₹9,999/mo | Starter + Google review dashboard + Instagram content calendar + analytics |
| Partner | ₹18,999/mo | Growth + Google/Meta Ads management + SEO basics + monthly PDF report |

**Upsell path:** Land on Starter → show results → upsell to Growth → then Partner.

**Go-to-market:**
1. First 2-3 clinics — free or heavily discounted (build case studies)
2. Wife's clinic as demo clinic #1 — real data, real results
3. WhatsApp outreach to clinic owners directly
4. Live dashboard demo as the primary sales tool
5. Use early clinic results to pitch more clinics

---

## Founder Constraint — NON-NEGOTIABLE

**Max 7 hours/week available to run this business.**

Every single product and technical decision must respect this constraint:

- Every feature must run without human involvement after setup
- No manual work per clinic after onboarding is complete
- Automate everything that can be automated
- Platform must scale without adding headcount
- **If a feature requires regular manual effort per clinic → do NOT build it. Flag it and suggest an automated alternative.**

---

## Core Product — What We're Building Now

These four things together form the complete, sellable, retainable core product:

**1. Patient Management** — the database
Full patient profiles, appointment history, treatment notes, appointment status tracking, CSV import for existing patient data. This is the foundation everything else depends on.

**2. WhatsApp Sequence Engine** — the engine
Not just one reminder — a full configurable sequence per trigger:
- Appointment booked → confirmation message
- 24 hours before appointment → reminder
- 2 hours before appointment → reminder
- Appointment completed → post-treatment follow-up (next day)
- No-show → re-booking nudge
- 6 months after last visit → recare reminder
- Patient inactive 3+ months → reactivation campaign

**3. Review Automation** — the quick win
2 days after appointment marked complete → auto WhatsApp with Google review link. Simple, powerful, visible result for clinic owner within 2 weeks. This is what makes them never want to cancel.

**4. Analytics Dashboard** — the proof
Patients seen this month, no-show rate, messages sent and delivered, reactivation rate, reviews generated, month-on-month growth. This is what the clinic owner opens every Monday morning.

**Bonus — Onboarding Checklist** (Super Admin view)
Per-clinic setup progress tracker:
- WhatsApp Business number connected
- Google Business Profile claimed and optimized
- Patient data imported
- First automation sequence activated
- Test message sent and confirmed

---

## What's NOT In Core Product (Build Later)

- Instagram content calendar → Phase 2
- Google/Meta Ads management → Phase 3
- SEO basics → Phase 3
- PDF reports → Phase 3
- Razorpay billing → Phase 3
- Patient-facing app or portal → not in scope yet
- Clinical workflows (prescriptions, treatment records, billing) → permanently out of scope
- Multi-location clinic chains → out of scope for now

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend | Node.js + Express | Runs via pm2, auto-starts on Windows login |
| Database | Supabase (PostgreSQL) | Live, hosted |
| Frontend | React + Tailwind CSS | Hosted on GitHub Pages |
| Deployment | GitHub Actions | Auto-deploy on push to main |
| Tunnel | serveo.net SSH tunnel | ⚠️ FRAGILE — monitor, but migrate only if a paying client is at risk |
| WhatsApp | Meta Cloud API | ⚠️ Currently mock mode — approval pending |
| Email | Resend | Free tier |
| Payments | Razorpay | Phase 3, not built yet |
| Cron jobs | node-cron | Runs every 30 minutes |

---

## Critical Technical Debt

These are risks to monitor — act only when they actually threaten the business:

1. **serveo.net tunnel** — one SSH disconnect kills all clinic automations. Keep on serveo for now (free). Migrate to a free-tier alternative (e.g., Render free tier) only if it causes real downtime for a paying client.

2. **WhatsApp mock mode** — the entire Starter plan value prop depends on real WhatsApp delivery. Meta Cloud API approval must be applied for — it's free, just needs approval.

3. **Manual onboarding** — currently Super Admin does all clinic setup manually. Acceptable until 5+ clinics. Automate when it starts eating into the 7 hrs/week budget.

**Spending rule: Free tier everything by default. Only spend money if there is clear, specific value — e.g., a paying client is at risk. Always flag and confirm before any paid tool/service.**

---

## Database Schema

- `clinics` — clinic profile, subscription tier, contact info, onboarding status
- `staff` — clinic staff with roles (super_admin, receptionist)
- `patients` — patient records per clinic with full history
- `appointments` — bookings with status (scheduled, completed, no-show, cancelled)
- `messages_log` — every WhatsApp/email sent: clinic_id, patient_id, message_type, status, timestamp
- `subscriptions` — subscription tier and billing status per clinic
- `automation_sequences` — configurable sequence definitions per clinic ⚠️ PLANNED, not yet created in Supabase

---

## Roles & Access

| Role | Access |
|------|--------|
| Super Admin | Full platform — all clinics, all data, messages log, reviews, reports, campaigns, onboarding checklist |
| Clinic Receptionist | Their clinic only — today's view, patients, appointments, messages log |

**Demo logins:**
- Super Admin: `admin@dentgrow.in` / `dentgrow123`
- Clinic Receptionist: `sunita@smilecare.com` / `dentgrow123`

---

## What's Built — Phase 1 ✅

- JWT authentication with role-based access control
- Super Admin dashboard — clinic list, clinic detail, messages log, reviews/reports/campaigns (stubs)
- Clinic Receptionist dashboard — today's view, patients list, add patient, patient detail, add appointment, messages log
- WhatsApp automation service (mock mode)
- Cron job — auto-sends reminders and follow-ups every 30 minutes
- Supabase schema with seed data
- pm2 auto-start on Windows login
- GitHub Actions auto-deploy to GitHub Pages

---

## What's Next — Planned Sprint 🔨

These are planned but not started yet. Pick one per session, build completely, test before moving on:

1. Deepen patient management — appointment status tracking, treatment notes, patient history, CSV import
2. WhatsApp sequence engine — full configurable trigger-based sequences (not just one reminder)
3. Review automation — auto WhatsApp with Google review link 2 days post-appointment
4. Analytics dashboard — key clinic metrics, month-on-month view
5. Onboarding checklist — per-clinic setup progress in Super Admin

---

## What's Next — Phase 2 🔲

- Real WhatsApp integration (once Meta Cloud API approved)
- Backend migration off serveo to proper hosting
- Google review dashboard
- Instagram content calendar
- Self-serve clinic onboarding flow
- Advanced analytics

---

## What's Later — Phase 3 🔲

- Google/Meta Ads management interface
- SEO basics per clinic
- Monthly PDF report auto-generation
- Razorpay billing + subscription management
- Multi-clinic Super Admin analytics

---

## Long-Term Vision

```
Today (Service):     We manage everything for clinics after one-time setup
Year 1 (Productize): Templates + config. Each new clinic deployed in hours.
Year 2 (SaaS):       Clinics self-serve. We just run the platform.
Year 3+ (Expand):    Same playbook for dermatology, physio, eye clinics.
```

**End goal: The growth operating system for every independent clinic in India.**

Dental is the entry point. The system is the product.

---

## North Star Metric

**Clinics retained month-over-month.**

Churn = failure. Retention = success. Every feature, every automation, every UX decision should be evaluated through this lens — does it make a clinic more likely to stay?

---

## UX Principles — Non-Negotiable

### The Receptionist Rule
The primary daily user is a clinic receptionist — not the dentist, not a tech-savvy person. She is managing a busy front desk with constant interruptions. Every screen must be:
1. **Fast** — minimum clicks, minimum fields. Adding a patient or booking must feel instant.
2. **Forgiving** — mistakes must be easy to fix. No scary errors. No data loss.
3. **Obvious** — one clear action per screen. She should never wonder what to tap next.
4. **Plain language** — no jargon. Button labels say exactly what they do. "Add Patient" not "Create Record".
5. **Mobile friendly** — she may be on a phone or tablet, not a desktop.

Before building any screen, ask: could a first-time user with basic WhatsApp skills figure this out in 30 seconds without training? If no — simplify.

### The Zero Training Rule
A new receptionist should be able to use all core features on day one without any manual or tutorial. If something needs explaining — redesign it.

### The Dentist Rule
The secondary user is the clinic owner/dentist. They open the app once a day maximum — usually in the morning to see today's schedule, or at night to check numbers. They care about trends and totals, not operational details. Their screens must be clean, data-forward, and scannable in under 2 minutes.

---

## Coding Principles

1. **Automation first** — if a feature requires manual work per clinic after onboarding, flag it and suggest an automated alternative before building
2. **Don't break what works** — Phase 1 is live. Always read existing code before modifying anything
3. **Mock before real** — always build mock mode first for external APIs so UI works without approval delays
4. **Keep it simple** — lean operation, no over-engineering, boring reliable tech over clever solutions
5. **Multi-clinic always** — every query, every automation, every feature must be scoped to a specific `clinic_id`. Never leak data across clinics. Ever.
6. **Log everything** — all automated messages must be written to `messages_log` with clinic_id, patient_id, message_type, status, timestamp
7. **No hardcoded secrets** — all API keys, tokens, passwords via environment variables only
8. **Seed data always works** — maintain working seed data so a fresh clone produces a working demo instantly
9. **One feature per session** — do not attempt to build multiple features in one session. Scope clearly, build completely, test before moving on.

---

## Local Dev Setup

```bash
# Fix npm PATH first (always needed in bash on Windows)
export PATH="/c/Program Files/nodejs:/c/Users/Anupam/AppData/Roaming/npm:$PATH"

# Backend
cd dentgrow/backend && npm run dev   # → http://localhost:3001

# Frontend
cd dentgrow/frontend && npm run dev  # → http://localhost:5173
```

- Supabase project ref: `houwsrssoujgbjalnffe`
- Supabase URL: `https://houwsrssoujgbjalnffe.supabase.co`
- pm2 processes: `dentgrow-backend` + `dentgrow-tunnel` (auto-start on Windows login)
- Tunnel URL: `dentgrow-backend.serveo.net`

---

## Folder Structure

```
/backend
  /routes        — Express route handlers
  /services      — Business logic (whatsapp, reviews, cron, sequences)
  /middleware    — Auth, error handling
  /db            — Supabase client + schema
  server.js      — Entry point

/frontend
  /src
    /components  — Reusable UI components
    /pages       — Page-level components (SuperAdmin, Receptionist)
    /hooks       — Custom React hooks
    /utils       — Helper functions
  index.html
```

---

## Session Checklist

Every Claude Code session must start with:
1. Read this CLAUDE.md fully
2. Identify which feature from "Current Sprint" we are working on
3. Read the relevant existing code before writing anything new
4. Confirm scope — what exactly is being built this session
5. Never assume — if something is unclear, ask

---

*Last updated: Full co-founder strategy session — DentGrow vision, two clinic types, core product defined, roadmap clarified, technical debt documented.*
