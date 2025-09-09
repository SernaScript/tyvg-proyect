-- CreateTable
CREATE TABLE "public"."siigo_warehouses" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "hasMovements" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siigo_warehouses_pkey" PRIMARY KEY ("id")
);
