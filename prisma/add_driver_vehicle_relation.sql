-- Migration: Add driver_vehicles table
-- This migration adds the driver_vehicles table to relate drivers with vehicles
-- IMPORTANT: This only adds the new table, it does not modify existing data
-- Execute this script directly in your database to add the table safely

-- CreateTable
CREATE TABLE IF NOT EXISTS "driver_vehicles" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "driver_vehicles_driverId_vehicleId_key" ON "driver_vehicles"("driverId", "vehicleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "driver_vehicles_driverId_isActive_idx" ON "driver_vehicles"("driverId", "isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "driver_vehicles_vehicleId_isActive_idx" ON "driver_vehicles"("vehicleId", "isActive");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'driver_vehicles_driverId_fkey'
    ) THEN
        ALTER TABLE "driver_vehicles" 
        ADD CONSTRAINT "driver_vehicles_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'driver_vehicles_vehicleId_fkey'
    ) THEN
        ALTER TABLE "driver_vehicles" 
        ADD CONSTRAINT "driver_vehicles_vehicleId_fkey" 
        FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

