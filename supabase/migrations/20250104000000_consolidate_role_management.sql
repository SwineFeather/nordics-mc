-- Migration: Consolidate Role Management
-- Remove deprecated boolean role fields and ensure consistent role-based authorization
-- Date: 2025-01-04

-- Step 1: Create a backup of current role data
CREATE TABLE IF NOT EXISTS role_migration_backup AS
SELECT 
    id,
    role,
    is_admin,
    is_moderator,
    is_editor,
    created_at,
    updated_at
FROM profiles
WHERE is_admin = true OR is_moderator = true OR is_editor = true;

-- Step 2: Update profiles table to ensure role field is populated from boolean fields
UPDATE profiles 
SET role = CASE 
    WHEN is_admin = true THEN 'admin'
    WHEN is_moderator = true THEN 'moderator'
    WHEN is_editor = true THEN 'editor'
    ELSE COALESCE(role, 'member')
END
WHERE role IS NULL OR (is_admin = true OR is_moderator = true OR is_editor = true);

-- Step 3: Update forum_categories to use role-based access instead of boolean fields
-- First, add a new role_required column
ALTER TABLE forum_categories 
ADD COLUMN IF NOT EXISTS role_required text DEFAULT 'member';

-- Update role_required based on existing is_moderator_only
UPDATE forum_categories 
SET role_required = CASE 
    WHEN is_moderator_only = true THEN 'moderator'
    ELSE 'member'
END;

-- Step 4: Update RLS policies to use role field consistently
-- Drop old policies that reference boolean fields
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Moderators can view all profiles" ON profiles;

-- Create new role-based policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin')
        )
    );

CREATE POLICY "Moderators can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Step 5: Update forum access policies
DROP POLICY IF EXISTS "Users can view forum categories" ON forum_categories;
DROP POLICY IF EXISTS "Moderators can manage forum categories" ON forum_categories;

CREATE POLICY "Users can view forum categories" ON forum_categories
    FOR SELECT USING (true);

CREATE POLICY "Role-based forum access" ON forum_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN (
                CASE forum_categories.role_required
                    WHEN 'admin' THEN ARRAY['admin']
                    WHEN 'moderator' THEN ARRAY['admin', 'moderator']
                    WHEN 'editor' THEN ARRAY['admin', 'moderator', 'editor']
                    ELSE ARRAY['admin', 'moderator', 'editor', 'member']
                END
            )
        )
    );

-- Step 6: Create role hierarchy enforcement function
CREATE OR REPLACE FUNCTION enforce_role_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent downgrading admin roles
    IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
        RAISE EXCEPTION 'Cannot downgrade admin role';
    END IF;
    
    -- Only admins can assign admin role
    IF NEW.role = 'admin' AND NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can assign admin role';
    END IF;
    
    -- Only admins and moderators can assign moderator role
    IF NEW.role = 'moderator' AND NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ) THEN
        RAISE EXCEPTION 'Insufficient permissions to assign moderator role';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create role audit logging function
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role != NEW.role THEN
        INSERT INTO role_audit_log (
            user_id,
            old_role,
            new_role,
            changed_by,
            changed_at,
            reason
        ) VALUES (
            NEW.id,
            OLD.role,
            NEW.role,
            auth.uid(),
            NOW(),
            'Role updated'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create role audit log table
CREATE TABLE IF NOT EXISTS role_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    old_role text,
    new_role text,
    changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    changed_at timestamp with time zone DEFAULT NOW(),
    reason text,
    ip_address inet,
    user_agent text
);

-- Step 9: Add triggers for role enforcement and auditing
DROP TRIGGER IF EXISTS enforce_role_hierarchy_trigger ON profiles;
DROP TRIGGER IF EXISTS log_role_change_trigger ON profiles;

CREATE TRIGGER enforce_role_hierarchy_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION enforce_role_hierarchy();

CREATE TRIGGER log_role_change_trigger
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_role_change();

-- Step 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_user_id ON role_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_changed_at ON role_audit_log(changed_at);

-- Step 11: Update any remaining references in other tables
-- This will be done in subsequent migrations as needed

-- Step 12: Create a view for role-based permissions
CREATE OR REPLACE VIEW role_permissions AS
SELECT 
    role,
    CASE 
        WHEN role = 'admin' THEN true
        ELSE false
    END as can_manage_users,
    CASE 
        WHEN role IN ('admin', 'moderator') THEN true
        ELSE false
    END as can_moderate_content,
    CASE 
        WHEN role IN ('admin', 'moderator', 'editor') THEN true
        ELSE false
    END as can_edit_content,
    CASE 
        WHEN role IN ('admin', 'moderator', 'editor', 'member') THEN true
        ELSE false
    END as can_view_content
FROM (VALUES ('admin'), ('moderator'), ('editor'), ('member')) AS roles(role);

-- Migration complete - deprecated boolean fields are now consolidated into role enum
-- All authorization checks should use the role field and role_permissions view
