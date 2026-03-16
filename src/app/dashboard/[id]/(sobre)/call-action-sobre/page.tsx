import HeroClientLayout from "@/layout/HeroClientLayout";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HeroPage() {
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
    console.error("Erro ao buscar dados do Hero no servidor:", error);
  }

  return <HeroClientLayout initialData={initialData} initialTheme="sobre" />;
}