-- Migration Script: Refactor Trip Model
-- IMPORTANT: Review and adjust this script based on your actual data before running
-- Backup your database before executing this script!

-- Step 1: Create new enum MeasureType
CREATE TYPE "MeasureType" AS ENUM ('METROS_CUBICOS', 'TONELADAS');

-- Step 2: Add new columns to trips table (temporarily nullable)
ALTER TABLE "trips" 
  ADD COLUMN IF NOT EXISTS "materialId" TEXT,
  ADD COLUMN IF NOT EXISTS "projectId" TEXT,
  ADD COLUMN IF NOT EXISTS "date" DATE,
  ADD COLUMN IF NOT EXISTS "incomingReceiptNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "outcomingReceiptNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "quantity" DECIMAL(12,3),
  ADD COLUMN IF NOT EXISTS "measure" "MeasureType",
  ADD COLUMN IF NOT EXISTS "salePrice" DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "outsourcedPrice" DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "invoiceId" TEXT,
  ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "observation" TEXT,
  ADD COLUMN IF NOT EXISTS "createdBy" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- Step 3: Migrate data from trip_requests to trips
-- This migrates projectId from trip_requests
UPDATE "trips" t
SET "projectId" = tr."projectId"
FROM "trip_requests" tr
WHERE t."tripRequestId" = tr."id"
  AND t."projectId" IS NULL;

-- Step 4: Migrate materialId from trip_materials (takes first material if multiple)
UPDATE "trips" t
SET "materialId" = tm."materialId",
    "quantity" = COALESCE(tm."deliveredQuantity", tm."loadedQuantity", tm."programmedQuantity", 0)
FROM (
  SELECT DISTINCT ON ("tripId") 
    "tripId", 
    "materialId",
    "deliveredQuantity",
    "loadedQuantity",
    "programmedQuantity"
  FROM "trip_materials"
  ORDER BY "tripId", "createdAt" DESC
) tm
WHERE t."id" = tm."tripId"
  AND t."materialId" IS NULL;

-- Step 5: Set default measure if null (you may want to adjust this logic)
UPDATE "trips"
SET "measure" = 'TONELADAS'::"MeasureType"
WHERE "measure" IS NULL;

-- Step 6: Set default date from scheduledDate if exists, or use current date
UPDATE "trips"
SET "date" = COALESCE("scheduledDate"::DATE, CURRENT_DATE)
WHERE "date" IS NULL;

-- Step 7: Set default quantity to 0 if null
UPDATE "trips"
SET "quantity" = 0
WHERE "quantity" IS NULL;

-- Step 8: Set default createdBy (use first user or adjust as needed)
-- This ensures all trips have a createdBy value
UPDATE "trips"
SET "createdBy" = COALESCE(
  (SELECT "id" FROM "users" WHERE "isActive" = true ORDER BY "createdAt" ASC LIMIT 1),
  (SELECT "id" FROM "users" ORDER BY "createdAt" ASC LIMIT 1)
)
WHERE "createdBy" IS NULL;

-- Step 9: Remove old columns from trips table
ALTER TABLE "trips"
  DROP COLUMN IF EXISTS "tripRequestId",
  DROP COLUMN IF EXISTS "waybillNumber",
  DROP COLUMN IF EXISTS "scheduledDate",
  DROP COLUMN IF EXISTS "actualStartDate",
  DROP COLUMN IF EXISTS "actualEndDate",
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "certifiedWeight",
  DROP COLUMN IF EXISTS "observations";

-- Step 10: Remove old indexes
DROP INDEX IF EXISTS "trips_status_scheduledDate_idx";
DROP INDEX IF EXISTS "trips_driverId_status_idx";
DROP INDEX IF EXISTS "trips_tripRequestId_idx";

-- Step 11: Add new indexes
CREATE INDEX IF NOT EXISTS "trips_projectId_date_idx" ON "trips"("projectId", "date");
CREATE INDEX IF NOT EXISTS "trips_driverId_date_idx" ON "trips"("driverId", "date");
CREATE INDEX IF NOT EXISTS "trips_materialId_idx" ON "trips"("materialId");
CREATE INDEX IF NOT EXISTS "trips_isApproved_idx" ON "trips"("isApproved");

-- Step 12: Add foreign keys for new columns
DO $$ 
BEGIN
  -- Add foreign key for materialId
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trips_materialId_fkey'
  ) THEN
    ALTER TABLE "trips"
      ADD CONSTRAINT "trips_materialId_fkey" 
      FOREIGN KEY ("materialId") REFERENCES "materials"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  -- Add foreign key for projectId
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trips_projectId_fkey'
  ) THEN
    ALTER TABLE "trips"
      ADD CONSTRAINT "trips_projectId_fkey" 
      FOREIGN KEY ("projectId") REFERENCES "projects"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  -- Add foreign key for invoiceId
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trips_invoiceId_fkey'
  ) THEN
    ALTER TABLE "trips"
      ADD CONSTRAINT "trips_invoiceId_fkey" 
      FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- Add foreign key for createdBy
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trips_createdBy_fkey'
  ) THEN
    ALTER TABLE "trips"
      ADD CONSTRAINT "trips_createdBy_fkey" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  -- Add foreign key for updatedBy
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trips_updatedBy_fkey'
  ) THEN
    ALTER TABLE "trips"
      ADD CONSTRAINT "trips_updatedBy_fkey" 
      FOREIGN KEY ("updatedBy") REFERENCES "users"("id") 
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Step 13: Verify all required data exists before making columns NOT NULL
-- Check for any NULL values in required fields
DO $$
DECLARE
  null_material_count INTEGER;
  null_project_count INTEGER;
  null_date_count INTEGER;
  null_quantity_count INTEGER;
  null_measure_count INTEGER;
  null_created_by_count INTEGER;
BEGIN
  -- Count NULL values in required fields
  SELECT COUNT(*) INTO null_material_count FROM "trips" WHERE "materialId" IS NULL;
  SELECT COUNT(*) INTO null_project_count FROM "trips" WHERE "projectId" IS NULL;
  SELECT COUNT(*) INTO null_date_count FROM "trips" WHERE "date" IS NULL;
  SELECT COUNT(*) INTO null_quantity_count FROM "trips" WHERE "quantity" IS NULL;
  SELECT COUNT(*) INTO null_measure_count FROM "trips" WHERE "measure" IS NULL;
  SELECT COUNT(*) INTO null_created_by_count FROM "trips" WHERE "createdBy" IS NULL;

  -- Raise an error if any required fields have NULL values
  IF null_material_count > 0 THEN
    RAISE EXCEPTION 'Cannot proceed: % trips have NULL materialId. Please fix data before making column NOT NULL.', null_material_count;
  END IF;

  IF null_project_count > 0 THEN
    RAISE EXCEPTION 'Cannot proceed: % trips have NULL projectId. Please fix data before making column NOT NULL.', null_project_count;
  END IF;

  IF null_date_count > 0 THEN
    RAISE EXCEPTION 'Cannot proceed: % trips have NULL date. Please fix data before making column NOT NULL.', null_date_count;
  END IF;

  IF null_quantity_count > 0 THEN
    RAISE EXCEPTION 'Cannot proceed: % trips have NULL quantity. Please fix data before making column NOT NULL.', null_quantity_count;
  END IF;

  IF null_measure_count > 0 THEN
    RAISE EXCEPTION 'Cannot proceed: % trips have NULL measure. Please fix data before making column NOT NULL.', null_measure_count;
  END IF;

  IF null_created_by_count > 0 THEN
    RAISE EXCEPTION 'Cannot proceed: % trips have NULL createdBy. Please fix data before making column NOT NULL.', null_created_by_count;
  END IF;

  -- All validations passed, make columns NOT NULL
  ALTER TABLE "trips" ALTER COLUMN "materialId" SET NOT NULL;
  ALTER TABLE "trips" ALTER COLUMN "projectId" SET NOT NULL;
  ALTER TABLE "trips" ALTER COLUMN "date" SET NOT NULL;
  ALTER TABLE "trips" ALTER COLUMN "quantity" SET NOT NULL;
  ALTER TABLE "trips" ALTER COLUMN "measure" SET NOT NULL;
  ALTER TABLE "trips" ALTER COLUMN "createdBy" SET NOT NULL;

  RAISE NOTICE 'Successfully made all required columns NOT NULL';
END $$;

-- Step 14: Remove evidenceType from trip_evidences
ALTER TABLE "trip_evidences"
  DROP COLUMN IF EXISTS "evidenceType";

-- Step 15: Drop old tables (WARNING: This will delete all data in these tables)
-- Only run these if you are sure you don't need the data
-- Review your data first before uncommenting these lines
-- DROP TABLE IF EXISTS "trip_expenses" CASCADE;
-- DROP TABLE IF EXISTS "trip_materials" CASCADE;
-- DROP TABLE IF EXISTS "trip_request_materials" CASCADE;
-- DROP TABLE IF EXISTS "trip_requests" CASCADE;

-- Step 16: Drop old enums (WARNING: This will fail if any tables still reference them)
-- Only run these after dropping the tables above
-- DROP TYPE IF EXISTS "TripRequestPriority";
-- DROP TYPE IF EXISTS "TripRequestStatus";
-- DROP TYPE IF EXISTS "TripStatus";
-- DROP TYPE IF EXISTS "ExpenseType";
-- DROP TYPE IF EXISTS "EvidenceType";

