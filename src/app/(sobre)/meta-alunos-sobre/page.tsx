import prisma from "@/lib/prisma";
import MetaAlunosClientLayout from "./MetaAlunosClientLayout";

export const dynamic = "force-dynamic";

export default async function MetaAlunosPage() {
  let initialData = null;
  
  try {
    const dbData = await prisma.formData.findFirst({
      where: {
        type: "tegbe-institucional",
        subtype: "meta-alunos" 
      }
    });

    if (dbData && dbData.values) {
      initialData = dbData.values;
    }
  } catch (error) {
    console.error("Erro ao buscar dados de Meta Alunos no servidor:", error);
  }

  return <MetaAlunosClientLayout initialData={initialData} />;
}