-- CreateTable
CREATE TABLE "public"."siigo_accounts_payable" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "consecutive" INTEGER NOT NULL,
    "quote" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL,
    "providerIdentification" TEXT NOT NULL,
    "providerBranchOffice" INTEGER NOT NULL,
    "providerName" TEXT NOT NULL,
    "costCenterName" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencyBalance" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "generatedRequestId" TEXT NOT NULL,

    CONSTRAINT "siigo_accounts_payable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."siigo_accounts_payable_generated" (
    "id" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpoint" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "pageSize" INTEGER NOT NULL,
    "totalResults" INTEGER NOT NULL,
    "recordsProcessed" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siigo_accounts_payable_generated_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."siigo_accounts_payable" ADD CONSTRAINT "siigo_accounts_payable_generatedRequestId_fkey" FOREIGN KEY ("generatedRequestId") REFERENCES "public"."siigo_accounts_payable_generated"("id") ON DELETE CASCADE ON UPDATE CASCADE;
