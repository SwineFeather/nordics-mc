
-- Create tables for marketplace data
CREATE TABLE public.marketplace_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  shop_type TEXT,
  is_active BOOLEAN DEFAULT true,
  is_sponsored BOOLEAN DEFAULT false,
  sponsored_priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  mysql_shop_id TEXT UNIQUE -- Reference to original MySQL ID
);

CREATE TABLE public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  shop_name TEXT,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  mysql_transaction_id TEXT UNIQUE -- Reference to original MySQL ID
);

-- Add indexes for better performance
CREATE INDEX idx_marketplace_shops_active ON public.marketplace_shops(is_active);
CREATE INDEX idx_marketplace_shops_sponsored ON public.marketplace_shops(is_sponsored, sponsored_priority);
CREATE INDEX idx_marketplace_transactions_date ON public.marketplace_transactions(transaction_date DESC);
CREATE INDEX idx_marketplace_transactions_buyer ON public.marketplace_transactions(buyer_name);
CREATE INDEX idx_marketplace_transactions_seller ON public.marketplace_transactions(seller_name);

-- Enable RLS (make public for now, can be restricted later)
ALTER TABLE public.marketplace_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (shops and transactions are public data)
CREATE POLICY "Anyone can view shops" ON public.marketplace_shops FOR SELECT USING (true);
CREATE POLICY "Anyone can view transactions" ON public.marketplace_transactions FOR SELECT USING (true);

-- Only authenticated users with proper permissions can modify shops
CREATE POLICY "Authenticated users can manage shops" ON public.marketplace_shops 
FOR ALL USING (auth.role() = 'authenticated');

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_marketplace_shops
  BEFORE UPDATE ON public.marketplace_shops
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
