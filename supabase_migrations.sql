-- =============================================
-- Chala Le Gouter Antillais - Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
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

-- Enable Row Level Security (optional for production)
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- For MVP: Allow all operations (enable RLS + policies for production)
-- CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all on menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime on orders
-- Run in Dashboard → Database → Replication → Enable realtime for "orders" table
-- OR run this SQL:
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items(category);
CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(is_available);
