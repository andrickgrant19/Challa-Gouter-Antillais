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

-- Patch existing tables that pre-date the stripe_session_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Menu items table
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

-- Contact messages table (replaces previous MongoDB collection)
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

-- Realtime: ensure rows broadcast in full
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE contact_messages REPLICA IDENTITY FULL;
ALTER TABLE catering_requests REPLICA IDENTITY FULL;

-- Enable Realtime on orders, contact_messages, catering_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE orders';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contact_messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'catering_requests') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE catering_requests';
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

-- =============================================
-- RLS NOTE for production (currently disabled for MVP)
-- =============================================
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE catering_requests ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "anyone can view available menu" ON menu_items FOR SELECT USING (is_available = true);
-- CREATE POLICY "auth can manage orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "auth can read messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "auth can read catering" ON catering_requests FOR SELECT USING (auth.role() = 'authenticated');
