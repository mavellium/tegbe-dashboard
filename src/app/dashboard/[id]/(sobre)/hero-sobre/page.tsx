import prisma from "@/lib/prisma";
import HeroSettingsClientLayout from "./HeroSettingsClientLayout";

export const dynamic = "force-dynamic";

export default async function HeroSettingsPage() {
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
    console.error("Erro ao buscar configurações do Hero no servidor:", error);
  }

  return <HeroSettingsClientLayout initialData={initialData} />;
}