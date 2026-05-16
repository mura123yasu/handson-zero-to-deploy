CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true
);
