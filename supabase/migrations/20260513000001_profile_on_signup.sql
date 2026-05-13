-- Auto-create public.profiles row when a new auth.users is inserted.
-- Runs with SECURITY DEFINER so the trigger can write to public.profiles
-- regardless of the session role.
--
-- full_name resolution order:
--   1. raw_user_meta_data->>'full_name'  (from options.data on signUp)
--   2. email local-part
--   3. "User"

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_name text;
BEGIN
  resolved_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(split_part(NEW.email, '@', 1), ''),
    'User'
  );

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, resolved_name, 'user')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Replace any previous trigger to keep the migration idempotent.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
