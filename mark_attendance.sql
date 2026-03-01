-- =========================================================================
-- STEP 1: ADD 'entered_at' & 'is_vip' COLUMNS TO YOUR TABLES
-- Run this in the Supabase SQL Editor first to support time logging & VIP!
-- =========================================================================

ALTER TABLE ggu_students ADD COLUMN IF NOT EXISTS entered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE giet_degree ADD COLUMN IF NOT EXISTS entered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE giet_engineering ADD COLUMN IF NOT EXISTS entered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE giet_pharmacy ADD COLUMN IF NOT EXISTS entered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE giet_polytechnic ADD COLUMN IF NOT EXISTS entered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE maitri_vip_registrations ADD COLUMN IF NOT EXISTS entered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE maitri_faculty_registrations ADD COLUMN IF NOT EXISTS entered_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE ggu_students ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE giet_degree ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE giet_engineering ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE giet_pharmacy ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE giet_polytechnic ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE maitri_vip_registrations ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT true;
ALTER TABLE maitri_faculty_registrations ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE maitri_faculty_registrations ADD COLUMN IF NOT EXISTS attended_fest BOOLEAN DEFAULT false;

-- 4. Revert: Drop the is_suspended column from all tables
ALTER TABLE public.ggu_students DROP COLUMN IF EXISTS is_suspended;
ALTER TABLE public.giet_degree DROP COLUMN IF EXISTS is_suspended;
ALTER TABLE public.giet_engineering DROP COLUMN IF EXISTS is_suspended;
ALTER TABLE public.giet_pharmacy DROP COLUMN IF EXISTS is_suspended;
ALTER TABLE public.giet_polytechnic DROP COLUMN IF EXISTS is_suspended;
ALTER TABLE public.maitri_vip_registrations DROP COLUMN IF EXISTS is_suspended;
ALTER TABLE public.maitri_faculty_registrations DROP COLUMN IF EXISTS is_suspended;

-- =========================================================================
-- SQL query to forcefully mark attendance for a specific PIN manually
-- You will need to specify WHICH table you are updating now.
-- Example: UPDATE giet_degree ...
-- =========================================================================
UPDATE giet_degree
SET attended_fest = TRUE, entered_at = NOW()
WHERE pin_number ILIKE 'ENTER_PIN_NUMBER_HERE';


-- =========================================================================
-- AUTOMATIC MARK ATTENDANCE FUNCTION (RPC) 
-- Optional: If you prefer to use RPC in the app instead of UPDATE directly
-- *NOTE: RPC for multiple tables dynamically is complex. 
-- It is recommended to handle this in JS using Promise.all as done in Scanner.jsx
-- =========================================================================
