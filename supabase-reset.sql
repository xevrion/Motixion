-- ⚠️ DANGER: This will DELETE ALL DATA and recreate tables
-- Only run this if you want to start completely fresh!

-- Drop all tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.daily_logs CASCADE;
DROP TABLE IF EXISTS public.streaks CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.calculate_daily_points(NUMERIC, NUMERIC, TIME, INTEGER, INTEGER);

-- Now you can run the supabase-schema.sql file to recreate everything
