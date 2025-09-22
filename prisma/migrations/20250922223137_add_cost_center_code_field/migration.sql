/*
  Warnings:

  - Added the required column `costCenterCode` to the `siigo_accounts_payable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."siigo_accounts_payable" ADD COLUMN     "costCenterCode" INTEGER NOT NULL;
