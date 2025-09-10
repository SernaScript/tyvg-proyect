/*
  Warnings:

  - You are about to drop the column `fuelType` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenance` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `nextMaintenance` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `odometer` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `vehicles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."vehicles" DROP COLUMN "fuelType",
DROP COLUMN "lastMaintenance",
DROP COLUMN "location",
DROP COLUMN "nextMaintenance",
DROP COLUMN "odometer",
DROP COLUMN "year";

-- CreateTable
CREATE TABLE "public"."fuel_purchases" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "provider" TEXT NOT NULL,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receipt" TEXT,

    CONSTRAINT "fuel_purchases_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."fuel_purchases" ADD CONSTRAINT "fuel_purchases_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
