import SuccessCasesClientLayout from "@/layout/SuccessCasesClientLayout";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuccessCasesPage() {
  
  let initialData = null;
  try {
    const dbData = await prisma.formData.findUnique({
      where: {
        type_subtype: {
          type: "tegbe-institucional",
          subtype: "company"
        }
      }
    });

    if (dbData && dbData.values) {
      initialData = dbData.values;
    }
  } catch (error) {
    console.error("Erro ao buscar dados de Cases de Sucesso no servidor:", error);
  }

  return <SuccessCasesClientLayout initialData={initialData} initialTheme="marketing" />;
}