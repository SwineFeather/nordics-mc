#!/bin/bash

# Auto Wiki Page Creation Setup Script
# This script helps set up the automatic wiki page creation system

set -e

echo "🚀 Setting up Automatic Wiki Page Creation System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
check_supabase_cli() {
    print_status "Checking Supabase CLI installation..."
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first:"
        echo "  npm install -g supabase"
        echo "  or visit: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    print_success "Supabase CLI is installed"
}

# Check if we're in a Supabase project
check_supabase_project() {
    print_status "Checking if we're in a Supabase project..."
    if [ ! -f "supabase/config.toml" ]; then
        print_error "Not in a Supabase project. Please run this script from your project root."
        exit 1
    fi
    print_success "Supabase project detected"
}

# Deploy the database migration
deploy_migration() {
    print_status "Deploying database migration..."
    
    # Check if migration file exists
    if [ ! -f "supabase/migrations/20250115000000_auto_wiki_pages.sql" ]; then
        print_error "Migration file not found: supabase/migrations/20250115000000_auto_wiki_pages.sql"
        exit 1
    fi
    
    # Deploy the migration
    if supabase db push; then
        print_success "Database migration deployed successfully"
    else
        print_error "Failed to deploy database migration"
        exit 1
    fi
}

# Deploy edge functions
deploy_edge_functions() {
    print_status "Deploying edge functions..."
    
    # Check if edge function directories exist
    if [ ! -d "supabase/functions/create-wiki-page" ]; then
        print_error "Edge function not found: supabase/functions/create-wiki-page"
        exit 1
    fi
    
    if [ ! -d "supabase/functions/sync-all-wiki-pages" ]; then
        print_error "Edge function not found: supabase/functions/sync-all-wiki-pages"
        exit 1
    fi
    
    # Deploy create-wiki-page function
    print_status "Deploying create-wiki-page function..."
    if supabase functions deploy create-wiki-page; then
        print_success "create-wiki-page function deployed"
    else
        print_error "Failed to deploy create-wiki-page function"
        exit 1
    fi
    
    # Deploy sync-all-wiki-pages function
    print_status "Deploying sync-all-wiki-pages function..."
    if supabase functions deploy sync-all-wiki-pages; then
        print_success "sync-all-wiki-pages function deployed"
    else
        print_error "Failed to deploy sync-all-wiki-pages function"
        exit 1
    fi
}

# Verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    # Check if functions are accessible
    print_status "Testing edge functions..."
    
    # Get the project URL
    PROJECT_URL=$(supabase status --output json | jq -r '.api.url' 2>/dev/null || echo "")
    
    if [ -n "$PROJECT_URL" ]; then
        print_success "Project URL: $PROJECT_URL"
        print_status "You can test the functions at:"
        echo "  - $PROJECT_URL/functions/v1/create-wiki-page"
        echo "  - $PROJECT_URL/functions/v1/sync-all-wiki-pages"
    else
        print_warning "Could not determine project URL. Check your Supabase dashboard."
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. 📊 Check the Admin Panel:"
    echo "   - Go to your website's /admin page"
    echo "   - Look for the 'Automatic Wiki Page Manager' section"
    echo "   - Check the system status"
    echo ""
    echo "2. 🔄 Test Manual Sync:"
    echo "   - Click 'Sync All Wiki Pages' to create pages for existing towns/nations"
    echo "   - Monitor the progress and results"
    echo ""
    echo "3. 🧪 Test Automatic Creation:"
    echo "   - Add a new town or nation to your database"
    echo "   - Verify that a wiki page is automatically created"
    echo ""
    echo "4. 📚 Check the Wiki:"
    echo "   - Go to your wiki page"
    echo "   - Look for the 'Nordics/Towns' and 'Nordics/Nations' folders"
    echo "   - Verify that pages have been created with proper content"
    echo ""
    echo "5. 📖 Read the Documentation:"
    echo "   - Check AUTO_WIKI_SETUP_GUIDE.md for detailed information"
    echo "   - Review the admin interface features"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Check Supabase Edge Function logs for errors"
    echo "   - Verify database functions are properly installed"
    echo "   - Ensure the wiki storage bucket exists and has proper permissions"
    echo ""
}

# Main execution
main() {
    echo "Starting setup process..."
    echo ""
    
    check_supabase_cli
    check_supabase_project
    deploy_migration
    deploy_edge_functions
    verify_setup
    show_next_steps
    
    print_success "Setup completed successfully!"
}

# Run the main function
main "$@" 