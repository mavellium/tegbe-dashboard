import HeroTextsClientLayout from "@/layout/HeroTextsClientLayout";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HeroTextsPage() {
  let initialData = null;
  
  try {
    const dbData = await prisma.formData.findUnique({
      where: {
        type_subtype: {
          type: "tegbe-institucional",
          subtype: "equipe"
        }
      }
    });

    if (dbData && dbData.values) {
      initialData = dbData.values;
    }
  } catch (error) {
    console.error("Erro ao buscar dados de Textos Equipe no servidor:", error);
  }

  return <HeroTextsClientLayout initialData={initialData} initialTheme="marketing"  />;
}