/*
  Warnings:

  - You are about to drop the column `createdById` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `expenseType` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `expenseId` on the `reimbursement` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordedById` to the `expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceId` to the `expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceType` to the `expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `reimbursement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `reimbursement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expenseDate` to the `reimbursement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `reimbursement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptUrl` to the `reimbursement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DirectExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "ExpenseSourceType" AS ENUM ('REIMBURSEMENT', 'DIRECT_EXPENSE');

-- AlterEnum
ALTER TYPE "ReimbursementStatus" ADD VALUE 'REVIEWED';

-- DropForeignKey
ALTER TABLE "expense" DROP CONSTRAINT "expense_createdById_fkey";

-- DropForeignKey
ALTER TABLE "reimbursement" DROP CONSTRAINT "reimbursement_expenseId_fkey";

-- DropIndex
DROP INDEX "expense_expenseType_idx";

-- DropIndex
DROP INDEX "reimbursement_expenseId_key";

-- AlterTable
ALTER TABLE "expense" DROP COLUMN "createdById",
DROP COLUMN "expenseType",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "paymentProofUrl" TEXT,
ADD COLUMN     "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recordedById" TEXT NOT NULL,
ADD COLUMN     "sourceId" TEXT NOT NULL,
ADD COLUMN     "sourceType" "ExpenseSourceType" NOT NULL,
ALTER COLUMN "projectId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reimbursement" DROP COLUMN "expenseId",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "approvalNotes" TEXT,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "expenseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentNotes" TEXT,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "receiptUrl" TEXT NOT NULL,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedBy" TEXT,
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT;

-- CreateTable
CREATE TABLE "expense_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "expense_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_expense_request" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "invoiceUrl" TEXT NOT NULL,
    "status" "DirectExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvalNotes" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidById" TEXT,
    "paymentProofUrl" TEXT,
    "paymentDate" TIMESTAMP(3),
    "paymentNotes" TEXT,
    "rejectionReason" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direct_expense_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expense_category_name_key" ON "expense_category"("name");

-- CreateIndex
CREATE INDEX "expense_category_isActive_idx" ON "expense_category"("isActive");

-- CreateIndex
CREATE INDEX "direct_expense_request_status_idx" ON "direct_expense_request"("status");

-- CreateIndex
CREATE INDEX "direct_expense_request_createdById_idx" ON "direct_expense_request"("createdById");

-- CreateIndex
CREATE INDEX "direct_expense_request_projectId_idx" ON "direct_expense_request"("projectId");

-- CreateIndex
CREATE INDEX "direct_expense_request_categoryId_idx" ON "direct_expense_request"("categoryId");

-- CreateIndex
CREATE INDEX "expense_categoryId_idx" ON "expense"("categoryId");

-- CreateIndex
CREATE INDEX "expense_sourceType_idx" ON "expense"("sourceType");

-- CreateIndex
CREATE INDEX "reimbursement_projectId_idx" ON "reimbursement"("projectId");

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement" ADD CONSTRAINT "reimbursement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reimbursement" ADD CONSTRAINT "reimbursement_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_category" ADD CONSTRAINT "expense_category_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_expense_request" ADD CONSTRAINT "direct_expense_request_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_expense_request" ADD CONSTRAINT "direct_expense_request_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_expense_request" ADD CONSTRAINT "direct_expense_request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_expense_request" ADD CONSTRAINT "direct_expense_request_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_expense_request" ADD CONSTRAINT "direct_expense_request_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
