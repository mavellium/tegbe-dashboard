/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

type PageActionType = "CREATED" | "UPDATED";

interface PageData {
  id: string;
  title: string;
  subtitle: string | null;
  icon: string;
  endpoint: string;
  formData: any;
  subCompanyId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export async function createPageHistory(page: PageData, action: PageActionType) {
  const lastEntry = await prisma.pageHistory.findFirst({
    where: { pageId: page.id },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const nextVersion = (lastEntry?.version ?? 0) + 1;

  const snapshot = {
    id: page.id,
    title: page.title,
    subtitle: page.subtitle,
    icon: page.icon,
    endpoint: page.endpoint,
    formData: page.formData,
    subCompanyId: page.subCompanyId,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };

  return prisma.pageHistory.create({
    data: {
      pageId: page.id,
      title: page.title,
      subtitle: page.subtitle,
      icon: page.icon,
      endpoint: page.endpoint,
      formData: page.formData,
      subCompanyId: page.subCompanyId,
      version: nextVersion,
      action,
      snapshot,
    },
  });
}
