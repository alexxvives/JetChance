-- Seed data for JetChance D1 Database
-- Run this after schema.sql to create initial admin accounts
-- ========================================================================

-- Create super-admin user
-- Password: Admin123! (change this immediately after first login)
-- Password hash generated with bcrypt rounds=10
INSERT INTO users (id, email, password_hash, role, created_at)
VALUES (
  'US00001',
  'admin@jetchance.com',
  '$2b$10$RwQomf0iXGg6Manng/JPcO8mwJZjUPKf5JKVZ6KZvgNNUbX2Recgi',
  'super-admin',
  CURRENT_TIMESTAMP
);

-- Create regular admin user for testing
INSERT INTO users (id, email, password_hash, role, created_at)
VALUES (
  'US00002',
  'operator@jetchance.com',
  '$2b$10$RYq/6.hanlhGf8wA6W5kp..xNmZh9q2Oqy6WF6LNIe0vD8dwtMHUC',
  'admin',
  CURRENT_TIMESTAMP
);

-- Note: Generate password hashes using:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123!', 10).then(console.log);"
