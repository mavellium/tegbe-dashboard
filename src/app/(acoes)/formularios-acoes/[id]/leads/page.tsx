import LeadsClientLayout from "@/layout/LeadsClientLayout";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FormLeadsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const form = await prisma.component.findUnique({
    where: { id },
    select: { name: true }
  });

  if (!form) {
    redirect("/formularios-acoes");
  }

  const submissions = await prisma.componentData.findMany({
    where: { componentId: id },
    orderBy: { createdAt: "desc" }
  });

  const serializedSubmissions = submissions.map(sub => ({
    id: sub.id,
    data: sub.data,
    createdAt: sub.createdAt.toISOString()
  }));

  return <LeadsClientLayout formName={form.name} submissions={serializedSubmissions} />;
}