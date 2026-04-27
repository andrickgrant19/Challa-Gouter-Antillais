-- =============================================
-- Chala Le Gouter Antillais - Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- This script is idempotent: safe to run multiple times.
-- =============================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text,
  order_type text NOT NULL CHECK (order_type IN ('pickup', 'delivery')),
  notes text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  stripe_payment_intent_id text,
  stripe_session_id text
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Menu items table (kept for legacy / family meals)
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false
);

-- Catering requests table
CREATE TABLE IF NOT EXISTS catering_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  event_date date,
  event_type text,
  guest_count integer,
  message text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'quoted', 'booked', 'completed', 'cancelled'))
);

-- =============================================
-- COMBO BUILDER TABLES
-- =============================================

-- Proteins (Step 1)
CREATE TABLE IF NOT EXISTS combo_proteins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- Sides & Bases (Step 2 + Step 3)
CREATE TABLE IF NOT EXISTS combo_sides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price_modifier numeric(10,2) NOT NULL DEFAULT 0,
  side_type text NOT NULL CHECK (side_type IN ('base', 'side')),
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- Extras (Step 4)
CREATE TABLE IF NOT EXISTS combo_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- Realtime: full rows on update for live dashboard
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE contact_messages REPLICA IDENTITY FULL;
ALTER TABLE catering_requests REPLICA IDENTITY FULL;
ALTER TABLE combo_proteins REPLICA IDENTITY FULL;
ALTER TABLE combo_sides REPLICA IDENTITY FULL;
ALTER TABLE combo_extras REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='orders') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE orders';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='contact_messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='catering_requests') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE catering_requests';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='combo_proteins') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE combo_proteins';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='combo_sides') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE combo_sides';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='combo_extras') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE combo_extras';
  END IF;
END$$;

-- Indexes
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items(category);
CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_is_read_idx ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS catering_requests_created_at_idx ON catering_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS catering_requests_status_idx ON catering_requests(status);
CREATE INDEX IF NOT EXISTS catering_requests_event_date_idx ON catering_requests(event_date);
CREATE INDEX IF NOT EXISTS combo_proteins_available_idx ON combo_proteins(is_available);
CREATE INDEX IF NOT EXISTS combo_proteins_order_idx ON combo_proteins(display_order);
CREATE INDEX IF NOT EXISTS combo_sides_available_idx ON combo_sides(is_available);
CREATE INDEX IF NOT EXISTS combo_sides_type_idx ON combo_sides(side_type);
CREATE INDEX IF NOT EXISTS combo_sides_order_idx ON combo_sides(display_order);
CREATE INDEX IF NOT EXISTS combo_extras_available_idx ON combo_extras(is_available);
CREATE INDEX IF NOT EXISTS combo_extras_order_idx ON combo_extras(display_order);

-- =============================================
-- SEED DATA (idempotent — uses ON CONFLICT on unique name)
-- =============================================

INSERT INTO combo_proteins (name, name_en, price, display_order) VALUES
  ('Griot',         'Griot',         25.95, 1),
  ('Poulet',        'Chicken',       25.95, 2),
  ('Dinde',         'Turkey',        27.95, 3),
  ('Poisson Frit',  'Fried Fish',    26.95, 4),
  ('Légume',        'Vegetarian',    27.95, 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO combo_sides (name, name_en, price_modifier, side_type, display_order) VALUES
  ('Riz Blanc',        'White Rice',    0.00, 'base', 1),
  ('Riz Collé',        'Sticky Rice',   0.00, 'base', 2),
  ('Riz Djondjon',     'Djondjon Rice', 2.00, 'base', 3),
  ('Salade',           'Salad',         0.00, 'side', 1),
  ('Macaroni',         'Macaroni',      0.00, 'side', 2),
  ('Banane Plantain',  'Plantain',      0.00, 'side', 3),
  ('Aucun',            'None',          0.00, 'side', 99)
ON CONFLICT (name) DO NOTHING;

INSERT INTO combo_extras (name, name_en, price, display_order) VALUES
  ('Extra Viande',          'Extra Meat',    5.00, 1),
  ('Extra Riz',             'Extra Rice',    2.50, 2),
  ('Sauce Supplémentaire',  'Extra Sauce',   1.50, 3),
  ('Banane Plantain',       'Plantain',      2.00, 4),
  ('Pikliz',                'Pikliz',        1.50, 5)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY
-- Public can read available items.
-- Authenticated (owner) can manage everything.
-- =============================================

ALTER TABLE combo_proteins ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_sides    ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_extras   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read combo_proteins" ON combo_proteins;
DROP POLICY IF EXISTS "auth manage combo_proteins" ON combo_proteins;
CREATE POLICY "public read combo_proteins" ON combo_proteins FOR SELECT USING (true);
CREATE POLICY "auth manage combo_proteins" ON combo_proteins FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "public read combo_sides" ON combo_sides;
DROP POLICY IF EXISTS "auth manage combo_sides" ON combo_sides;
CREATE POLICY "public read combo_sides" ON combo_sides FOR SELECT USING (true);
CREATE POLICY "auth manage combo_sides" ON combo_sides FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "public read combo_extras" ON combo_extras;
DROP POLICY IF EXISTS "auth manage combo_extras" ON combo_extras;
CREATE POLICY "public read combo_extras" ON combo_extras FOR SELECT USING (true);
CREATE POLICY "auth manage combo_extras" ON combo_extras FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
