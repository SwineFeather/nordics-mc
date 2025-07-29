-- Create plots table for Nyrvalos game
CREATE TABLE IF NOT EXISTS public.plots (
  id SERIAL PRIMARY KEY,
  town_id INTEGER REFERENCES public.towns(id) ON DELETE SET NULL,
  town_name TEXT,
  world_name TEXT NOT NULL DEFAULT 'world',
  x INTEGER NOT NULL, -- chunk X coordinate
  z INTEGER NOT NULL, -- chunk Z coordinate
  plot_type TEXT,
  owner_uuid TEXT,
  owner_name TEXT,
  price DECIMAL(10,2),
  for_sale BOOLEAN DEFAULT false,
  market_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plots_world_name ON public.plots(world_name);
CREATE INDEX IF NOT EXISTS idx_plots_town_id ON public.plots(town_id);
CREATE INDEX IF NOT EXISTS idx_plots_coordinates ON public.plots(x, z);
CREATE INDEX IF NOT EXISTS idx_plots_owner_uuid ON public.plots(owner_uuid);

-- Enable RLS
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (plots are public data)
CREATE POLICY "Anyone can view plots" ON public.plots FOR SELECT USING (true);

-- Insert some sample plots for testing
INSERT INTO public.plots (town_id, town_name, world_name, x, z, plot_type, owner_name, price, for_sale) VALUES
(1, 'Nordheim', 'world', 0, 0, 'residential', 'Nordheim_Mayor', 1000.00, false),
(1, 'Nordheim', 'world', 1, 0, 'commercial', 'Nordheim_Mayor', 1500.00, true),
(1, 'Nordheim', 'world', 0, 1, 'industrial', 'Nordheim_Mayor', 800.00, false),
(2, 'Garvias', 'world', 10, 10, 'residential', 'Garvias_Mayor', 1200.00, false),
(2, 'Garvias', 'world', 11, 10, 'commercial', 'Garvias_Mayor', 1800.00, true),
(2, 'Garvias', 'world', 10, 11, 'industrial', 'Garvias_Mayor', 900.00, false),
(3, 'Eastern Port', 'world', -5, 5, 'residential', 'Eastern_Mayor', 1100.00, false),
(3, 'Eastern Port', 'world', -4, 5, 'commercial', 'Eastern_Mayor', 1600.00, true),
(3, 'Eastern Port', 'world', -5, 6, 'industrial', 'Eastern_Mayor', 850.00, false),
(4, 'Western Fort', 'world', 5, -5, 'residential', 'Western_Mayor', 1300.00, false),
(4, 'Western Fort', 'world', 6, -5, 'commercial', 'Western_Mayor', 1900.00, true),
(4, 'Western Fort', 'world', 5, -4, 'industrial', 'Western_Mayor', 950.00, false),
(5, 'Central Hub', 'world', 15, 15, 'residential', 'Central_Mayor', 1400.00, false),
(5, 'Central Hub', 'world', 16, 15, 'commercial', 'Central_Mayor', 2000.00, true),
(5, 'Central Hub', 'world', 15, 16, 'industrial', 'Central_Mayor', 1000.00, false); 