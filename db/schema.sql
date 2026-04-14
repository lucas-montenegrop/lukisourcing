DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS material_factories CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS developments CASCADE;
DROP TABLE IF EXISTS stages_of_material CASCADE;
DROP TABLE IF EXISTS fabrics CASCADE;
DROP TABLE IF EXISTS factory_contacts CASCADE;
DROP TABLE IF EXISTS factories CASCADE;
DROP TABLE IF EXISTS company_memberships CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE factories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  factory_name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  address TEXT,
  website VARCHAR(255),
  main_phone VARCHAR(50),
  main_email VARCHAR(255),
  lead_time VARCHAR(100),
  shipping_account_number VARCHAR(100),
  shipping_notes TEXT,
  notes TEXT
);

CREATE TABLE factory_contacts (
  id SERIAL PRIMARY KEY,
  factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(150),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary_contact BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT
);

CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  status VARCHAR(100) NOT NULL DEFAULT 'requested',
  cost NUMERIC(10, 2),
  eta DATE
);

CREATE TABLE material_factories (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  quoted_cost NUMERIC(10, 2),
  lead_time VARCHAR(100),
  notes TEXT,
  UNIQUE (material_id, factory_id)
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_factories_user_id ON factories(user_id);
CREATE INDEX idx_factory_contacts_factory_id ON factory_contacts(factory_id);
CREATE INDEX idx_materials_created_by ON materials(created_by);
CREATE INDEX idx_material_factories_material_id ON material_factories(material_id);
CREATE INDEX idx_material_factories_factory_id ON material_factories(factory_id);
CREATE INDEX idx_notes_material_id ON notes(material_id);
CREATE INDEX idx_activity_log_material_id ON activity_log(material_id);
