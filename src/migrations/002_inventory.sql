CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY
);

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;


CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;

ALTER TABLE stock_transfers
  ADD COLUMN idempotency_key TEXT UNIQUE;


CREATE TABLE IF NOT EXISTS stock (
  product_id INT REFERENCES products(id),
  location_id INT REFERENCES locations(id),
  quantity INT NOT NULL CHECK (quantity >= 0),
  PRIMARY KEY (product_id, location_id)
);

CREATE TABLE IF NOT EXISTS stock_transfers (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  from_location_id INT NOT NULL,
  to_location_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);


INSERT INTO locations (id, name) VALUES
  (1, 'Warehouse A'),
  (2, 'Warehouse B')
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name) VALUES
  (1, 'Laptop')
ON CONFLICT DO NOTHING;

INSERT INTO stock (product_id, location_id, quantity)
VALUES (1, 1, 20)
ON CONFLICT (product_id, location_id)
DO UPDATE SET quantity = EXCLUDED.quantity;