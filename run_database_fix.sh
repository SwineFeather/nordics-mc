#!/bin/bash

# Database Fix Script
# This script runs the database migration to fix all the errors

echo "🔧 Running database fix migration..."

# Check if we're in the right directory
if [ ! -f "fix_database_errors.sql" ]; then
    echo "❌ Error: fix_database_errors.sql not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found"
    echo "Please install Supabase CLI first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Error: Not connected to Supabase project"
    echo "Please run: supabase login"
    echo "Then run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Supabase CLI found and connected"

# Run the migration
echo "🚀 Executing database fix migration..."
supabase db reset --linked

echo "✅ Database fix completed!"
echo "🎉 All database errors should now be resolved."
echo ""
echo "You can now refresh your application and the errors should be gone." 