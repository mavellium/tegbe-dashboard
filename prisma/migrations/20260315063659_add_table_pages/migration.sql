-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'FileText',
    "endpoint" TEXT NOT NULL,
    "formData" JSONB,
    "subCompanyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_subCompanyId_fkey" FOREIGN KEY ("subCompanyId") REFERENCES "sub_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
