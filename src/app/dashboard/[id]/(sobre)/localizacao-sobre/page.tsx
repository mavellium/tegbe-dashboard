import prisma from "@/lib/prisma";
import LocalizacaoClientLayout from "./LocalizacaoClientLayout";

export const dynamic = "force-dynamic";

export default async function LocalizacaoPage() {
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
    console.error("Erro ao buscar dados de Localização no servidor:", error);
  }

  return <LocalizacaoClientLayout initialData={initialData} />;
}