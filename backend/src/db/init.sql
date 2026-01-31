CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(20, 2) DEFAULT 0.00,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  rate DECIMAL(30, 8) NOT NULL,
  min BIGINT,
  max BIGINT,
  category VARCHAR(255),
  provider_id INT,
  external_service_id VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_url VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'STANDARD',
  balance DECIMAL(20, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'active',
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  service_id INT REFERENCES services(id),
  link VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  charge DECIMAL(20, 2),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, canceled
  external_order_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  amount DECIMAL(20, 2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'deposit', 'spend', 'refund', 'manual'
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  type VARCHAR(50) NOT NULL, -- 'crypto', 'card', 'manual', 'other'
  bonus_percentage DECIMAL(5, 2) DEFAULT 0.00,
  charge_fee_percentage DECIMAL(5, 2) DEFAULT 0.00,
  instructions TEXT,
  qr_code_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


