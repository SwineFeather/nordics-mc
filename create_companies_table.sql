-- Create companies table for business listings
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly name
    tagline VARCHAR(500), -- Short description/tagline
    description TEXT, -- Full company description (supports Markdown)
    
    -- Contact Information
    website_url VARCHAR(500),
    email VARCHAR(255),
    discord_invite VARCHAR(255),
    discord_server_id VARCHAR(255),
    
    -- Visual Assets
    logo_url VARCHAR(500), -- URL to company logo
    banner_url VARCHAR(500), -- URL to company banner image
    primary_color VARCHAR(7), -- Hex color code (e.g., #FF5733)
    secondary_color VARCHAR(7), -- Hex color code
    
    -- Business Details
    business_type VARCHAR(100), -- e.g., "Corporation", "Partnership", "Sole Proprietorship"
    industry VARCHAR(100), -- e.g., "Mining", "Farming", "Trading", "Manufacturing"
    founded_date DATE,
    headquarters_world VARCHAR(100), -- Which world the company is based in
    headquarters_coords VARCHAR(100), -- "x,y,z" coordinates
    
    -- Social & Community
    social_links JSONB, -- Store social media links as JSON
    member_count INTEGER DEFAULT 0,
    max_members INTEGER,
    is_public BOOLEAN DEFAULT true, -- Whether company profile is public
    is_featured BOOLEAN DEFAULT false, -- Featured on marketplace
    
    -- Content & Media
    gallery_images JSONB, -- Array of image URLs
    featured_products JSONB, -- Array of featured product IDs
    achievements JSONB, -- Company achievements and milestones
    
    -- Financial Information
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0, -- 0.00 to 5.00
    review_count INTEGER DEFAULT 0,
    
    -- Ownership & Management
    owner_uuid UUID NOT NULL, -- Company founder/owner
    ceo_uuid UUID, -- Current CEO (can be different from owner)
    executives JSONB, -- Array of executive positions and UUIDs
    members JSONB, -- Array of member UUIDs with roles
    
    -- Status & Verification
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended, pending
    verification_status VARCHAR(50) DEFAULT 'unverified', -- unverified, verified, premium
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by UUID, -- Admin who verified the company
    
    -- SEO & Discovery
    keywords TEXT[], -- Array of search keywords
    tags TEXT[], -- Array of tags for categorization
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_hex_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$' OR primary_color IS NULL),
    CONSTRAINT valid_hex_color_secondary CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$' OR secondary_color IS NULL),
    CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5),
    CONSTRAINT valid_member_count CHECK (member_count >= 0),
    CONSTRAINT valid_max_members CHECK (max_members IS NULL OR max_members > 0),
    CONSTRAINT valid_revenue CHECK (total_revenue >= 0),
    CONSTRAINT valid_transactions CHECK (total_transactions >= 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_uuid);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_featured ON companies(is_featured);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(average_rating DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public companies
CREATE POLICY "Users can view public companies" ON companies
    FOR SELECT USING (is_public = true OR status = 'active');

-- Policy: Company owners can update their own companies
CREATE POLICY "Company owners can update their companies" ON companies
    FOR UPDATE USING (owner_uuid = auth.uid());

-- Policy: Company owners can delete their own companies
CREATE POLICY "Company owners can delete their companies" ON companies
    FOR DELETE USING (owner_uuid = auth.uid());

-- Policy: Authenticated users can create companies
CREATE POLICY "Authenticated users can create companies" ON companies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Add company column to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Create index for company_id in shops table
CREATE INDEX IF NOT EXISTS idx_shops_company_id ON shops(company_id);

-- Add featured column to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for featured shops
CREATE INDEX IF NOT EXISTS idx_shops_featured ON shops(is_featured);

-- Insert some sample companies for testing
INSERT INTO companies (
    name, 
    slug, 
    tagline, 
    description, 
    owner_uuid, 
    industry, 
    business_type,
    primary_color,
    secondary_color,
    is_public,
    status
) VALUES 
(
    'Nordic Mining Co.',
    'nordic-mining-co',
    'Premium mining services and resources',
    '# Nordic Mining Co.

**Your trusted partner for all mining needs!**

We specialize in:
- Diamond and emerald mining
- Redstone and lapis extraction
- Custom mining expeditions
- Equipment rental

> 💡 **Special Offer**: 10% discount for new customers!

Contact us for bulk orders and custom mining contracts.',
    '00000000-0000-0000-0000-000000000001', -- Replace with actual UUID
    'Mining',
    'Corporation',
    '#1E40AF',
    '#F59E0B',
    true,
    'active'
),
(
    'Aqua Union Trading',
    'aqua-union-trading',
    'Connecting traders across the server',
    '# Aqua Union Trading

**The premier trading company on Nordics World**

Our services include:
- Bulk item trading
- Price matching
- Secure transactions
- Market analysis

> ℹ️ **Verified Company**: Trusted by hundreds of players

Join our trading network today!',
    '00000000-0000-0000-0000-000000000002', -- Replace with actual UUID
    'Trading',
    'Partnership',
    '#059669',
    '#7C3AED',
    true,
    'active'
),
(
    'Iron Forge Industries',
    'iron-forge-industries',
    'Quality tools and weapons crafted with care',
    '# Iron Forge Industries

**Crafting excellence since day one**

We produce:
- Diamond tools and weapons
- Netherite equipment
- Custom enchantments
- Repair services

> ⚠️ **Limited Supply**: High-demand items may have wait times

Quality guaranteed or your money back!',
    '00000000-0000-0000-0000-000000000003', -- Replace with actual UUID
    'Manufacturing',
    'Corporation',
    '#DC2626',
    '#6B7280',
    true,
    'active'
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO authenticated; 