import DualShowcaseClientLayout from "@/layout/DualShowcaseClientLayout";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DualShowcasePage() {
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
    console.error("Erro ao buscar dados do Dual Showcase no servidor:", error);
  }

  return <DualShowcaseClientLayout initialData={initialData} initialTheme={"marketing"} />;
}