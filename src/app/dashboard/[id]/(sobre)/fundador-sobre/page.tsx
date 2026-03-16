import prisma from "@/lib/prisma";
import CardFundadorClientLayout from "./CardFundadorClientLayout";

export const dynamic = "force-dynamic";

export default async function CardFundadorPage() {
  // Busca os dados diretamente do banco usando o Prisma no lado do servidor.
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
    console.error("Erro ao buscar dados do Card Fundador no servidor:", error);
  }

  return <CardFundadorClientLayout initialData={initialData} />;
}