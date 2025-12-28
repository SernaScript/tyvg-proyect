-- Migration: Create Preoperational Inspections Schema
-- This migration creates the tables for preoperational vehicle inspections
-- IMPORTANT: Review and adjust this script based on your actual data before running
-- Backup your database before executing this script!

-- ============================================================================
-- Table: preoperational_items
-- Catalog of items to check during inspections
-- ============================================================================
CREATE TABLE IF NOT EXISTS "preoperational_items" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for active items
CREATE INDEX IF NOT EXISTS "preoperational_items_isActive_idx" 
ON "preoperational_items"("isActive");

-- ============================================================================
-- Table: preoperational_inspections
-- Main inspection event
-- ============================================================================
CREATE TABLE IF NOT EXISTS "preoperational_inspections" (
    "id" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "initialMileage" DECIMAL(12, 2),
    "finalMileage" DECIMAL(12, 2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preoperational_inspections_pkey" PRIMARY KEY ("id")
);

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS "preoperational_inspections_driverId_idx" 
ON "preoperational_inspections"("driverId");

CREATE INDEX IF NOT EXISTS "preoperational_inspections_vehicleId_idx" 
ON "preoperational_inspections"("vehicleId");

-- Create index for inspection date (useful for queries)
CREATE INDEX IF NOT EXISTS "preoperational_inspections_inspectionDate_idx" 
ON "preoperational_inspections"("inspectionDate");

-- Add foreign key constraints
DO $$ 
BEGIN
    -- Foreign key to drivers table
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'preoperational_inspections_driverId_fkey'
    ) THEN
        ALTER TABLE "preoperational_inspections" 
        ADD CONSTRAINT "preoperational_inspections_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Foreign key to vehicles table
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'preoperational_inspections_vehicleId_fkey'
    ) THEN
        ALTER TABLE "preoperational_inspections" 
        ADD CONSTRAINT "preoperational_inspections_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- Table: preoperational_detail
-- Specific check result for each item in an inspection
-- ============================================================================
CREATE TABLE IF NOT EXISTS "preoperational_detail" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "observations" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preoperational_detail_pkey" PRIMARY KEY ("id")
);

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS "preoperational_detail_inspectionId_idx" 
ON "preoperational_detail"("inspectionId");

CREATE INDEX IF NOT EXISTS "preoperational_detail_itemId_idx" 
ON "preoperational_detail"("itemId");

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS "preoperational_detail_inspectionId_itemId_idx" 
ON "preoperational_detail"("inspectionId", "itemId");

-- Add foreign key constraints
DO $$ 
BEGIN
    -- Foreign key to preoperational_inspections table
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'preoperational_detail_inspectionId_fkey'
    ) THEN
        ALTER TABLE "preoperational_detail" 
        ADD CONSTRAINT "preoperational_detail_inspectionId_fkey" 
        FOREIGN KEY ("inspectionId") REFERENCES "preoperational_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Foreign key to preoperational_items table
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'preoperational_detail_itemId_fkey'
    ) THEN
        ALTER TABLE "preoperational_detail" 
        ADD CONSTRAINT "preoperational_detail_itemId_fkey" 
        FOREIGN KEY ("itemId") REFERENCES "preoperational_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- Trigger Function: Update updatedAt timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updatedAt on all tables
DO $$ 
BEGIN
    -- Trigger for preoperational_items
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_preoperational_items_updated_at'
    ) THEN
        CREATE TRIGGER update_preoperational_items_updated_at
        BEFORE UPDATE ON "preoperational_items"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger for preoperational_inspections
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_preoperational_inspections_updated_at'
    ) THEN
        CREATE TRIGGER update_preoperational_inspections_updated_at
        BEFORE UPDATE ON "preoperational_inspections"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger for preoperational_detail
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_preoperational_detail_updated_at'
    ) THEN
        CREATE TRIGGER update_preoperational_detail_updated_at
        BEFORE UPDATE ON "preoperational_detail"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- Insert some default preoperational items (optional)
-- ============================================================================
-- Uncomment and modify these if you want to insert default items
/*
INSERT INTO "preoperational_items" ("name", "isActive") VALUES
    ('Brake status', true),
    ('Tire pressure', true),
    ('Lights and signals', true),
    ('Engine oil level', true),
    ('Coolant level', true),
    ('Windshield wipers', true),
    ('Mirrors', true),
    ('Horn', true),
    ('Steering system', true),
    ('Suspension', true)
ON CONFLICT DO NOTHING;
*/

