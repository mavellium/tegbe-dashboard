import FormsDashboardLayout from "@/layout/FormsDashboardLayout";
import prisma from '@/lib/prisma'

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FormsDashboard() {
  const components = await prisma.component.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true, config: true },
  });

  const initialForms = components.map((form) => {
    let isDatabaseAction = true;
    
    try {
      const configObj = typeof form.config === 'string' 
        ? JSON.parse(form.config) 
        : form.config;
        
      if (configObj?.content?.actionType === 'whatsapp') {
        isDatabaseAction = false;
      }
    } catch (e) {
      console.error("Erro ao fazer parse do config do form", form.id);
    }

    return {
      id: form.id,
      name: form.name,
      updatedAt: form.updatedAt.toISOString(),
      isDatabaseAction,
    };
  });

  return <FormsDashboardLayout initialForms={initialForms} />;
}