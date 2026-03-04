# DentGrow 🦷

Growth partner platform for dental clinics in India. Automates patient retention, WhatsApp reminders, follow-ups, and growth reporting.

---

## Quick Start

### Step 1 — Install Node.js
Download from [nodejs.org](https://nodejs.org) (LTS version). Verify: `node --version`

### Step 2 — Set up Supabase
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run `backend/supabase/schema.sql`
4. Then run `backend/supabase/seed.sql` to add demo data
5. Go to **Project Settings → API** — copy the URL and service_role key

### Step 3 — Configure environment
```bash
cd backend
cp .env.example .env
```
Edit `.env` and fill in:
- `SUPABASE_URL` — from Supabase project settings
- `SUPABASE_SERVICE_KEY` — service_role key (not anon key)
- `JWT_SECRET` — any random string, e.g. `openssl rand -base64 32`

WhatsApp, email, and Razorpay can be left empty — the app runs in mock mode.

### Step 4 — Run the backend
```bash
cd backend
npm install
npm run dev
```
Server starts at http://localhost:3001

### Step 5 — Run the frontend
```bash
cd frontend
npm install
npm run dev
```
App opens at http://localhost:5173

---

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@dentgrow.in | dentgrow123 |
| SmileCare Receptionist | sunita@smilecare.com | dentgrow123 |
| BrightSmile Receptionist | kavya@brightsmile.com | dentgrow123 |
| OrthoCare Receptionist | renu@orthocare.com | dentgrow123 |

---

## Project Structure

```
dentgrow/
├── backend/
│   ├── src/
│   │   ├── config/        # Supabase client
│   │   ├── middleware/    # JWT auth + tenant isolation
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # WhatsApp (mock mode if no token)
│   │   ├── jobs/          # Cron automation jobs
│   │   └── index.js       # Express entry point
│   ├── supabase/
│   │   ├── schema.sql     # Run this first in Supabase
│   │   └── seed.sql       # Demo data (3 clinics, 30 patients)
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── superadmin/  # Dark admin dashboard
        │   └── clinic/      # White clinic portal (mobile-first)
        └── contexts/        # Auth state
```

---

## API Endpoints

### Auth
- `POST /api/auth/login` — email + password → JWT

### Clinics (superadmin only)
- `GET /api/clinics` — all clinics with stats
- `GET /api/clinics/mrr` — MRR + churn
- `POST /api/clinics` — onboard new clinic
- `PATCH /api/clinics/:id` — update status/plan/settings

### Patients (tenant-scoped)
- `GET /api/patients` — list (supports ?search=)
- `GET /api/patients/:id` — patient + appointment history
- `POST /api/patients` — add patient
- `PATCH /api/patients/:id` — update

### Appointments (tenant-scoped)
- `GET /api/appointments` — today's appointments (default)
- `POST /api/appointments` — create
- `PATCH /api/appointments/:id/status` — confirm/complete/no-show

### Messages
- `GET /api/messages` — messages log

### Analytics
- `GET /api/analytics/:clinicId` — dashboard stats

---

## WhatsApp Setup (when ready)

1. Create a Meta Business account at [developers.facebook.com](https://developers.facebook.com)
2. Create a WhatsApp Business app
3. Get your **Phone Number ID** and **Permanent Token**
4. Add to `.env`: `WHATSAPP_TOKEN=` and `WHATSAPP_PHONE_NUMBER_ID=`
5. Submit these message templates for approval in Meta Business Manager:
   - `appointment_reminder_24h`
   - `appointment_reminder_2h`
   - `post_treatment_general`
   - `reengagement`

Until you add these, messages are logged to the console (mock mode).

---

## Automation Engine

The cron scheduler runs automatically when the server starts:
- Every 30 mins: appointment reminders (24hr + 2hr before)
- Every 30 mins: post-treatment follow-ups (24hrs after complete)
- Daily 10am IST: re-engagement for patients inactive 180+ days
- Daily 10pm IST: no-show detection

All jobs are idempotent — safe to run multiple times, never sends duplicates.

---

## Deploy to Railway

1. Push this repo to GitHub
2. Create a Railway account at [railway.app](https://railway.app)
3. New project → Deploy from GitHub
4. Add backend as a service → set environment variables
5. Add frontend as a service
6. Done — Railway handles HTTPS and auto-deploys on push

---

## Phases

| Phase | Features | Status |
|-------|----------|--------|
| Phase 1 | Patient retention engine (Starter tier) | ✅ Built |
| Phase 2 | Google reviews + Instagram calendar + Campaigns (Growth tier) | 🔜 Scaffolded |
| Phase 3 | PDF reports + Ads tracker + Razorpay billing (Partner tier) | 🔜 Scaffolded |
