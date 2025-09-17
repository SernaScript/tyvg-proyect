-- CreateTable
CREATE TABLE "public"."flypass_data" (
    "id" TEXT NOT NULL,
    "cufe" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "relatedDocument" TEXT,
    "costCenter" TEXT,
    "licensePlate" TEXT NOT NULL,
    "tollName" TEXT NOT NULL,
    "vehicleCategory" TEXT NOT NULL,
    "passageDate" TIMESTAMP(3) NOT NULL,
    "transactionId" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2),
    "total" DECIMAL(12,2) NOT NULL,
    "tascode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyNit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flypass_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flypass_data_cufe_key" ON "public"."flypass_data"("cufe");
