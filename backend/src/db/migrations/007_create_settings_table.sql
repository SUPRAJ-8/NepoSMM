-- Create settings table for storing application configuration
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default contact links
INSERT INTO settings (key, value) VALUES
    ('whatsapp_number', '9779866887714'),
    ('tawk_token', ''),
    ('telegram_username', '')
ON CONFLICT (key) DO NOTHING;

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
