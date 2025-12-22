CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now()
);

-- Seed admin user (password: admin123)
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@example.com',
  '$2b$10$Q9E5F0GQkH0GQZrM0b6b9u1k5uKJZyE4JHj0f5s1f3YkzXH0YxwLe',
  'admin'
)
ON CONFLICT DO NOTHING;
