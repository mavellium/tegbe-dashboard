import FormsDashboardLayout from "@/layout/FormsDashboardLayout";
import prisma from '@/lib/prisma'

export default async function FormsDashboard() {
  const components = await prisma.component.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });

  const initialForms = components.map((form) => ({
    id: form.id,
    name: form.name,
    updatedAt: form.updatedAt.toISOString(),
  }));

  return <FormsDashboardLayout initialForms={initialForms} />;
}