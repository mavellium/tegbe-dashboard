import prisma from "@/lib/prisma";
import CarrosselEspecialistasClientLayout from "./CarrosselEspecialistasClientLayout";

export const dynamic = "force-dynamic";

export default async function CarrosselEspecialistasPage() {
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
    console.error("Erro ao buscar dados do Carrossel de Especialistas no servidor:", error);
  }

  return <CarrosselEspecialistasClientLayout initialData={initialData} />;
}