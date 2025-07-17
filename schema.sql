CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  description_en TEXT,
  description_zh TEXT,
  description_ar TEXT,
  price NUMERIC(10, 2),
  image_url TEXT
);