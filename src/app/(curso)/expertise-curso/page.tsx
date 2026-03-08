import DualShowcaseClientLayout from "@/layout/DualShowcaseClientLayout";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DualShowcasePage() {
  let initialData = null;
  try {
    const dbData = await prisma.formData.findUnique({
      where: {
        type_subtype: {
          type: "tegbe-institucional",
          subtype: "expertise"
        }
      }
    });

    if (dbData && dbData.values) {
      initialData = dbData.values;
    }
  } catch (error) {
    console.error("Erro ao buscar dados do Dual Showcase no servidor:", error);
  }

  return <DualShowcaseClientLayout initialData={initialData} initialTheme={"cursos"} />;
}