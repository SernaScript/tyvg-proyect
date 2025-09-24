-- AlterTable
ALTER TABLE "public"."siigo_accounts_payable" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentValue" DECIMAL(15,2);
