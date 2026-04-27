-- =============================================
-- Chala Le Gouter Antillais - Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- This script is idempotent: safe to run multiple times.
-- =============================================

-- ─── ORDERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text,
  order_type text NOT NULL CHECK (order_type IN ('pickup','delivery')),
  notes text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','in_progress','completed','cancelled')),
  stripe_payment_intent_id text,
  stripe_session_id text
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- ─── MENU ITEMS (legacy / family raw rows) ─────────────────────────────────
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
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS item_type text DEFAULT 'individual'
  CHECK (item_type IN ('individual','family','drink','dessert'));

UPDATE menu_items SET item_type = 'individual'
 WHERE item_type IS NULL
   AND category IN ('Griot','Poulet','Dinde','Poisson','Légume','Végétarien');
UPDATE menu_items SET item_type = 'family'
 WHERE category = 'Repas Familiale';

-- ─── CONTACT MESSAGES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL, email text NOT NULL,
  phone text, subject text NOT NULL, message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false
);

-- ─── CATERING REQUESTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catering_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL, email text NOT NULL, phone text,
  event_date date, event_type text, guest_count integer, message text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','quoted','booked','completed','cancelled'))
);

-- =============================================
-- INDIVIDUAL COMBO BUILDER
-- =============================================
CREATE TABLE IF NOT EXISTS combo_proteins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS combo_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price_modifier numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- combo_sides: just second-side options now (rice was extracted to combo_bases).
-- If an old combo_sides table exists with `side_type`, migrate then drop the column.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='combo_sides' AND column_name='side_type') THEN
    -- migrate any base rows into combo_bases
    INSERT INTO combo_bases (name, name_en, price_modifier, display_order)
      SELECT name, name_en, COALESCE(price_modifier,0), display_order
      FROM combo_sides WHERE side_type='base'
    ON CONFLICT (name) DO NOTHING;
    DELETE FROM combo_sides WHERE side_type='base';
    ALTER TABLE combo_sides DROP COLUMN side_type;
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS combo_sides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price_modifier numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS combo_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- =============================================
-- FAMILY MEAL BUILDER
-- =============================================
CREATE TABLE IF NOT EXISTS family_proteins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS family_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  price_modifier numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- =============================================
-- DRINKS
-- =============================================
CREATE TABLE IF NOT EXISTS drinks_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  name_en text,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS drinks_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  category_id uuid REFERENCES drinks_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_en text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- =============================================
-- DESSERTS
-- =============================================
CREATE TABLE IF NOT EXISTS desserts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  name_en text,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

-- =============================================
-- REALTIME PUBLICATION + REPLICA IDENTITY
-- =============================================
ALTER TABLE orders             REPLICA IDENTITY FULL;
ALTER TABLE contact_messages   REPLICA IDENTITY FULL;
ALTER TABLE catering_requests  REPLICA IDENTITY FULL;
ALTER TABLE combo_proteins     REPLICA IDENTITY FULL;
ALTER TABLE combo_bases        REPLICA IDENTITY FULL;
ALTER TABLE combo_sides        REPLICA IDENTITY FULL;
ALTER TABLE combo_extras       REPLICA IDENTITY FULL;
ALTER TABLE family_proteins    REPLICA IDENTITY FULL;
ALTER TABLE family_bases       REPLICA IDENTITY FULL;
ALTER TABLE drinks_categories  REPLICA IDENTITY FULL;
ALTER TABLE drinks_items       REPLICA IDENTITY FULL;
ALTER TABLE desserts           REPLICA IDENTITY FULL;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'orders','contact_messages','catering_requests',
    'combo_proteins','combo_bases','combo_sides','combo_extras',
    'family_proteins','family_bases',
    'drinks_categories','drinks_items','desserts'
  ]) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                   WHERE pubname='supabase_realtime' AND tablename=t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    END IF;
  END LOOP;
END$$;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items(category);
CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS menu_items_type_idx ON menu_items(item_type);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_is_read_idx ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS catering_requests_created_at_idx ON catering_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS catering_requests_status_idx ON catering_requests(status);

-- compact index helper
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'combo_proteins','combo_bases','combo_sides','combo_extras',
    'family_proteins','family_bases','drinks_categories','drinks_items','desserts'
  ]) LOOP
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I(is_available)', tbl||'_avail_idx', tbl);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I(display_order)', tbl||'_order_idx', tbl);
  END LOOP;
END$$;
CREATE INDEX IF NOT EXISTS drinks_items_cat_idx ON drinks_items(category_id);

-- =============================================
-- SEED DATA (idempotent — ON CONFLICT on unique name)
-- =============================================
INSERT INTO combo_proteins (name, name_en, price, display_order) VALUES
  ('Griot',        'Griot Pork',  25.95, 1),
  ('Poulet',       'Chicken',     25.95, 2),
  ('Dinde',        'Turkey',      27.95, 3),
  ('Poisson Frit', 'Fried Fish',  26.95, 4),
  ('Légume',       'Vegetarian',  27.95, 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO combo_bases (name, name_en, price_modifier, display_order) VALUES
  ('Riz Blanc',    'White Rice',    0.00, 1),
  ('Riz Collé',    'Sticky Rice',   0.00, 2),
  ('Riz Djondjon', 'Djondjon Rice', 2.00, 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO combo_sides (name, name_en, price_modifier, display_order) VALUES
  ('Salade',          'Salad',     0.00, 1),
  ('Macaroni',        'Macaroni',  0.00, 2),
  ('Banane Plantain', 'Plantain',  0.00, 3),
  ('Aucun',           'None',      0.00, 99)
ON CONFLICT (name) DO NOTHING;

INSERT INTO combo_extras (name, name_en, price, display_order) VALUES
  ('Extra Viande',         'Extra Meat',  5.00, 1),
  ('Extra Riz',            'Extra Rice',  2.50, 2),
  ('Sauce Supplémentaire', 'Extra Sauce', 1.50, 3),
  ('Banane Plantain',      'Plantain',    2.00, 4),
  ('Pikliz',               'Pikliz',      1.50, 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO family_proteins (name, name_en, price, display_order) VALUES
  ('Griot',  'Griot Pork', 64.97, 1),
  ('Poulet', 'Chicken',    64.97, 2),
  ('Dinde',  'Turkey',     69.97, 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO family_bases (name, name_en, price_modifier, display_order) VALUES
  ('Riz Blanc',    'White Rice',    0.00, 1),
  ('Riz Collé',    'Sticky Rice',   0.00, 2),
  ('Riz Djondjon', 'Djondjon Rice', 3.00, 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO drinks_categories (name, name_en, display_order) VALUES
  ('Boisson Gazeuse', 'Soft Drink',   1),
  ('Jus Naturel',     'Natural Juice',2),
  ('Eau',             'Water',        3),
  ('Boisson Chaude',  'Hot Drink',    4)
ON CONFLICT (name) DO NOTHING;

-- Seed soft drinks under "Boisson Gazeuse"
INSERT INTO drinks_items (category_id, name, name_en, price, display_order)
SELECT c.id, v.name, v.name_en, v.price, v.display_order
FROM (VALUES
  ('Coca-Cola',   'Coca-Cola',   2.50::numeric, 1),
  ('Pepsi',       'Pepsi',       2.50::numeric, 2),
  ('Orange Crush','Orange Crush',2.50::numeric, 3),
  ('Sprite',      'Sprite',      2.50::numeric, 4),
  ('Canada Dry',  'Canada Dry',  2.50::numeric, 5)
) AS v(name, name_en, price, display_order)
CROSS JOIN (SELECT id FROM drinks_categories WHERE name='Boisson Gazeuse' LIMIT 1) c
WHERE NOT EXISTS (
  SELECT 1 FROM drinks_items di
  WHERE di.category_id = c.id AND di.name = v.name
);

-- =============================================
-- ROW LEVEL SECURITY (public read, authenticated manage)
-- =============================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'combo_proteins','combo_bases','combo_sides','combo_extras',
    'family_proteins','family_bases',
    'drinks_categories','drinks_items','desserts'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "public read %s" ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "auth manage %s" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "public read %s" ON %I FOR SELECT USING (true)', t, t);
    EXECUTE format(
      'CREATE POLICY "auth manage %s" ON %I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')', t, t);
  END LOOP;
END$$;
