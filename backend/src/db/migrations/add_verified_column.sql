-- Add verified column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Create index for verified column
CREATE INDEX IF NOT EXISTS idx_services_verified ON services(verified);

-- Mark all existing active services as verified (for backward compatibility)
UPDATE services SET verified = TRUE WHERE status = 'active';
