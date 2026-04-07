DROP TABLE IF EXISTS stages_of_material;
DROP TABLE IF EXISTS fabrics;
DROP TABLE IF EXISTS factory_contacts;
DROP TABLE IF EXISTS factories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
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

CREATE TABLE fabrics (
  id SERIAL PRIMARY KEY,
  factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  fabric_collection_name VARCHAR(255),
  material_code VARCHAR(100),
  item_no VARCHAR(100),
  fabric_name VARCHAR(255) NOT NULL,
  description TEXT,
  composition VARCHAR(255),
  width_inch VARCHAR(50),
  width_cm VARCHAR(50),
  weight_glm NUMERIC(8, 2),
  weight_gsm NUMERIC(8, 2),
  weight_oz NUMERIC(8, 2),
  barcode VARCHAR(100),
  color_code VARCHAR(100),
  color_name VARCHAR(100),
  handfeel TEXT,
  has_image BOOLEAN NOT NULL DEFAULT FALSE,
  finish VARCHAR(150),
  record_date DATE,
  sustainability_notes TEXT,
  remarks TEXT,
  status VARCHAR(100) NOT NULL DEFAULT 'active'
);

CREATE TABLE stages_of_material (
  id SERIAL PRIMARY KEY,
  fabric_id INTEGER NOT NULL REFERENCES fabrics(id) ON DELETE CASCADE,
  factory_id INTEGER NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  brand_name VARCHAR(255) NOT NULL,
  season VARCHAR(100),
  status VARCHAR(100) NOT NULL DEFAULT 'in development',
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT
);

CREATE INDEX idx_factories_user_id ON factories(user_id);
CREATE INDEX idx_factory_contacts_factory_id ON factory_contacts(factory_id);
CREATE INDEX idx_fabrics_factory_id ON fabrics(factory_id);
CREATE INDEX idx_stages_of_material_fabric_id ON stages_of_material(fabric_id);
CREATE INDEX idx_stages_of_material_factory_id ON stages_of_material(factory_id);
