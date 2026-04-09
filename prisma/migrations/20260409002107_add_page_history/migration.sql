-- CreateEnum
CREATE TYPE "PageAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED');

-- CreateTable
CREATE TABLE "page_history" (
    "id" TEXT NOT NULL,
    "pageId" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "icon" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "formData" JSONB,
    "subCompanyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "action" "PageAction" NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_history_pageId_idx" ON "page_history"("pageId");

-- CreateIndex
CREATE INDEX "page_history_createdAt_idx" ON "page_history"("createdAt");

-- AddForeignKey
ALTER TABLE "page_history" ADD CONSTRAINT "page_history_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
