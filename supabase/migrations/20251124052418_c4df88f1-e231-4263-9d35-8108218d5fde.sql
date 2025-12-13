-- Create visitor role (future-proofing for premium features)
-- Note: The user_roles table already exists with 'role' as text type

-- Insert admin role for the current user
-- Replace 'YOUR_USER_ID' with the actual user ID from auth.users
-- You can get this from the Lovable Cloud dashboard or by querying auth.users

-- This is a placeholder - the actual user ID will be inserted after this migration
-- The admin will need to manually insert their admin role via the backend

-- For now, we're just documenting the role structure:
-- 'admin' - full access to both admin and editor panels
-- 'editor' - access to editor panels only
-- 'visitor' - planned for future premium gated features