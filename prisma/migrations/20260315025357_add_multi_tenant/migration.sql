/*
  Warnings:

  - A unique constraint covering the columns `[type,subtype,subCompanyId]` on the table `FormData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- DropIndex
DROP INDEX "FormData_type_subtype_key";

-- AlterTable
ALTER TABLE "FormData" ADD COLUMN     "subCompanyId" TEXT;

-- AlterTable
ALTER TABLE "components" ADD COLUMN     "subCompanyId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormData_type_subtype_subCompanyId_key" ON "FormData"("type", "subtype", "subCompanyId");

-- AddForeignKey
ALTER TABLE "sub_companies" ADD CONSTRAINT "sub_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_subCompanyId_fkey" FOREIGN KEY ("subCompanyId") REFERENCES "sub_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_subCompanyId_fkey" FOREIGN KEY ("subCompanyId") REFERENCES "sub_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
