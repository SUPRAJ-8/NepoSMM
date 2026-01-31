-- Migration: Add charge_fee_percentage to payment_methods table
-- Date: 2026-01-23

-- Add charge_fee_percentage column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'payment_methods' 
        AND column_name = 'charge_fee_percentage'
    ) THEN
        ALTER TABLE payment_methods 
        ADD COLUMN charge_fee_percentage DECIMAL(5, 2) DEFAULT 0.00;
    END IF;
END $$;
