-- DentGrow Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor
-- Passwords are all: "dentgrow123" (bcrypt hash)

-- ============================================================
-- CLINICS (3 demo clinics, different plans)
-- ============================================================
INSERT INTO clinics (id, name, owner_name, owner_mobile, email, plan, status, trial_ends_at, google_review_link, booking_link, instagram_handle)
VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'SmileCare Dental',
    'Dr. Rajesh Sharma',
    '9876543210',
    'smilecare@demo.com',
    'starter',
    'active',
    NOW() + INTERVAL '25 days',
    'https://g.page/r/smilecare-review',
    'https://smilecare.in/book',
    '@smilecare_dental'
  ),
  (
    'a1b2c3d4-0002-0002-0002-000000000002',
    'BrightSmile Clinic',
    'Dr. Priya Mehta',
    '9887766554',
    'brightsmile@demo.com',
    'growth',
    'active',
    NULL,
    'https://g.page/r/brightsmile-review',
    'https://brightsmile.in/book',
    '@brightsmile_clinic'
  ),
  (
    'a1b2c3d4-0003-0003-0003-000000000003',
    'OrthoCare Centre',
    'Dr. Amit Patel',
    '9911223344',
    'orthocare@demo.com',
    'partner',
    'active',
    NULL,
    'https://g.page/r/orthocare-review',
    'https://orthocare.in/book',
    '@orthocare_centre'
  );

-- ============================================================
-- STAFF
-- Password hash for "dentgrow123":
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================================
INSERT INTO staff (id, clinic_id, name, role, email, password_hash)
VALUES
  -- Super admin (no clinic_id)
  (
    'b1b2c3d4-0001-0001-0001-000000000001',
    NULL,
    'DentGrow Admin',
    'superadmin',
    'admin@dentgrow.in',
    '$2a$10$IbnSMS4xxxfqf0q2IM4nLehcSPJkZoGZX4BSGF2HGbIVtwJlM596.'
  ),
  -- SmileCare receptionist
  (
    'b1b2c3d4-0002-0002-0002-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Sunita Kumari',
    'receptionist',
    'sunita@smilecare.com',
    '$2a$10$IbnSMS4xxxfqf0q2IM4nLehcSPJkZoGZX4BSGF2HGbIVtwJlM596.'
  ),
  -- BrightSmile receptionist
  (
    'b1b2c3d4-0003-0003-0003-000000000003',
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Kavya Nair',
    'receptionist',
    'kavya@brightsmile.com',
    '$2a$10$IbnSMS4xxxfqf0q2IM4nLehcSPJkZoGZX4BSGF2HGbIVtwJlM596.'
  ),
  -- OrthoCare receptionist
  (
    'b1b2c3d4-0004-0004-0004-000000000004',
    'a1b2c3d4-0003-0003-0003-000000000003',
    'Renu Singh',
    'receptionist',
    'renu@orthocare.com',
    '$2a$10$IbnSMS4xxxfqf0q2IM4nLehcSPJkZoGZX4BSGF2HGbIVtwJlM596.'
  );

-- ============================================================
-- PATIENTS — SmileCare (10 patients)
-- ============================================================
INSERT INTO patients (id, clinic_id, name, mobile, age, gender, notes)
VALUES
  ('c0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Arjun Verma', '9812345678', 34, 'male', 'Sensitive teeth'),
  ('c0000001-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001', 'Deepika Joshi', '9823456789', 28, 'female', 'Braces follow-up'),
  ('c0000001-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001', 'Ramesh Gupta', '9834567890', 52, 'male', 'Diabetic patient'),
  ('c0000001-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'Anita Desai', '9845678901', 41, 'female', NULL),
  ('c0000001-0001-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000001', 'Vikram Yadav', '9856789012', 29, 'male', NULL),
  ('c0000001-0001-0001-0001-000000000006', 'a1b2c3d4-0001-0001-0001-000000000001', 'Pooja Iyer', '9867890123', 35, 'female', 'Anxiety about dental visits'),
  ('c0000001-0001-0001-0001-000000000007', 'a1b2c3d4-0001-0001-0001-000000000001', 'Suresh Patil', '9878901234', 47, 'male', NULL),
  ('c0000001-0001-0001-0001-000000000008', 'a1b2c3d4-0001-0001-0001-000000000001', 'Meena Pillai', '9889012345', 23, 'female', 'First visit'),
  ('c0000001-0001-0001-0001-000000000009', 'a1b2c3d4-0001-0001-0001-000000000001', 'Rohit Agarwal', '9890123456', 38, 'male', NULL),
  ('c0000001-0001-0001-0001-000000000010', 'a1b2c3d4-0001-0001-0001-000000000001', 'Shweta Kulkarni', '9801234567', 31, 'female', NULL);

-- ============================================================
-- PATIENTS — BrightSmile (10 patients)
-- ============================================================
INSERT INTO patients (id, clinic_id, name, mobile, age, gender, notes)
VALUES
  ('c0000002-0002-0002-0002-000000000001', 'a1b2c3d4-0002-0002-0002-000000000002', 'Karan Malhotra', '9712345678', 26, 'male', NULL),
  ('c0000002-0002-0002-0002-000000000002', 'a1b2c3d4-0002-0002-0002-000000000002', 'Neha Sharma', '9723456789', 32, 'female', 'Whitening interested'),
  ('c0000002-0002-0002-0002-000000000003', 'a1b2c3d4-0002-0002-0002-000000000002', 'Manish Kumar', '9734567890', 44, 'male', NULL),
  ('c0000002-0002-0002-0002-000000000004', 'a1b2c3d4-0002-0002-0002-000000000002', 'Sunita Reddy', '9745678901', 37, 'female', NULL),
  ('c0000002-0002-0002-0002-000000000005', 'a1b2c3d4-0002-0002-0002-000000000002', 'Aakash Singh', '9756789012', 19, 'male', 'Student'),
  ('c0000002-0002-0002-0002-000000000006', 'a1b2c3d4-0002-0002-0002-000000000002', 'Priti Jain', '9767890123', 55, 'female', 'BP medication'),
  ('c0000002-0002-0002-0002-000000000007', 'a1b2c3d4-0002-0002-0002-000000000002', 'Rajiv Nair', '9778901234', 42, 'male', NULL),
  ('c0000002-0002-0002-0002-000000000008', 'a1b2c3d4-0002-0002-0002-000000000002', 'Divya Menon', '9789012345', 27, 'female', NULL),
  ('c0000002-0002-0002-0002-000000000009', 'a1b2c3d4-0002-0002-0002-000000000002', 'Ashok Pandey', '9790123456', 61, 'male', 'Implant candidate'),
  ('c0000002-0002-0002-0002-000000000010', 'a1b2c3d4-0002-0002-0002-000000000002', 'Tanvi Shah', '9701234567', 24, 'female', NULL);

-- ============================================================
-- PATIENTS — OrthoCare (10 patients)
-- ============================================================
INSERT INTO patients (id, clinic_id, name, mobile, age, gender, notes)
VALUES
  ('c0000003-0003-0003-0003-000000000001', 'a1b2c3d4-0003-0003-0003-000000000003', 'Vivek Bansal', '9612345678', 15, 'male', 'Teen braces'),
  ('c0000003-0003-0003-0003-000000000002', 'a1b2c3d4-0003-0003-0003-000000000003', 'Ankita Tiwari', '9623456789', 22, 'female', 'Invisible aligners'),
  ('c0000003-0003-0003-0003-000000000003', 'a1b2c3d4-0003-0003-0003-000000000003', 'Harish Choudhary', '9634567890', 18, 'male', NULL),
  ('c0000003-0003-0003-0003-000000000004', 'a1b2c3d4-0003-0003-0003-000000000003', 'Ritu Saxena', '9645678901', 30, 'female', 'Adult braces'),
  ('c0000003-0003-0003-0003-000000000005', 'a1b2c3d4-0003-0003-0003-000000000003', 'Nikhil Bose', '9656789012', 13, 'male', NULL),
  ('c0000003-0003-0003-0003-000000000006', 'a1b2c3d4-0003-0003-0003-000000000003', 'Aarti Mishra', '9667890123', 25, 'female', NULL),
  ('c0000003-0003-0003-0003-000000000007', 'a1b2c3d4-0003-0003-0003-000000000003', 'Sanjay Dubey', '9678901234', 16, 'male', NULL),
  ('c0000003-0003-0003-0003-000000000008', 'a1b2c3d4-0003-0003-0003-000000000003', 'Nandita Rao', '9689012345', 28, 'female', NULL),
  ('c0000003-0003-0003-0003-000000000009', 'a1b2c3d4-0003-0003-0003-000000000003', 'Gaurav Kapoor', '9690123456', 20, 'male', NULL),
  ('c0000003-0003-0003-0003-000000000010', 'a1b2c3d4-0003-0003-0003-000000000003', 'Shruti Bajaj', '9601234567', 17, 'female', NULL);

-- ============================================================
-- APPOINTMENTS — SmileCare (mix of today + past + upcoming)
-- ============================================================
INSERT INTO appointments (clinic_id, patient_id, datetime, status, treatment_type, completed_at)
VALUES
  -- Today's appointments
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000001', NOW() + INTERVAL '1 hour', 'scheduled', 'Cleaning', NULL),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000002', NOW() + INTERVAL '2 hours', 'confirmed', 'Braces', NULL),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000003', NOW() + INTERVAL '3 hours', 'scheduled', 'RCT', NULL),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000004', NOW() - INTERVAL '2 hours', 'completed', 'Filling', NOW() - INTERVAL '2 hours'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000005', NOW() - INTERVAL '4 hours', 'no-show', 'Consultation', NULL),
  -- Past appointments (for analytics)
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000006', NOW() - INTERVAL '5 days', 'completed', 'Whitening', NOW() - INTERVAL '5 days'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000007', NOW() - INTERVAL '7 days', 'completed', 'Extraction', NOW() - INTERVAL '7 days'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000008', NOW() - INTERVAL '10 days', 'completed', 'Crown', NOW() - INTERVAL '10 days'),
  -- Old appointments (trigger re-engagement)
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000009', NOW() - INTERVAL '200 days', 'completed', 'Cleaning', NOW() - INTERVAL '200 days'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000010', NOW() - INTERVAL '190 days', 'completed', 'Filling', NOW() - INTERVAL '190 days');

-- ============================================================
-- APPOINTMENTS — BrightSmile
-- ============================================================
INSERT INTO appointments (clinic_id, patient_id, datetime, status, treatment_type, completed_at)
VALUES
  ('a1b2c3d4-0002-0002-0002-000000000002', 'c0000002-0002-0002-0002-000000000001', NOW() + INTERVAL '30 minutes', 'confirmed', 'Consultation', NULL),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'c0000002-0002-0002-0002-000000000002', NOW() + INTERVAL '90 minutes', 'scheduled', 'Whitening', NULL),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'c0000002-0002-0002-0002-000000000003', NOW() - INTERVAL '1 hour', 'completed', 'Filling', NOW() - INTERVAL '1 hour'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'c0000002-0002-0002-0002-000000000004', NOW() - INTERVAL '3 days', 'completed', 'Cleaning', NOW() - INTERVAL '3 days'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'c0000002-0002-0002-0002-000000000005', NOW() - INTERVAL '6 days', 'no-show', 'Consultation', NULL);

-- ============================================================
-- APPOINTMENTS — OrthoCare
-- ============================================================
INSERT INTO appointments (clinic_id, patient_id, datetime, status, treatment_type, completed_at)
VALUES
  ('a1b2c3d4-0003-0003-0003-000000000003', 'c0000003-0003-0003-0003-000000000001', NOW() + INTERVAL '2 hours', 'scheduled', 'Braces', NULL),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'c0000003-0003-0003-0003-000000000002', NOW() + INTERVAL '4 hours', 'confirmed', 'Consultation', NULL),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'c0000003-0003-0003-0003-000000000003', NOW() - INTERVAL '2 hours', 'completed', 'Braces', NOW() - INTERVAL '2 hours'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'c0000003-0003-0003-0003-000000000004', NOW() - INTERVAL '4 days', 'completed', 'Braces', NOW() - INTERVAL '4 days'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'c0000003-0003-0003-0003-000000000005', NOW() + INTERVAL '1 day', 'scheduled', 'Consultation', NULL);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
INSERT INTO subscriptions (clinic_id, plan, amount, status, current_period_start, current_period_end)
VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'starter', 5999, 'active', DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'growth', 9999, 'active', DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'partner', 18999, 'active', DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month');
