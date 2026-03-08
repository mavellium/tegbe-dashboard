import HeroClientLayout from "@/layout/HeroClientLayout";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HeroPage() {
  let initialData = null;
  
  try {
    const dbData = await prisma.formData.findUnique({
      where: {
        type_subtype: {
          type: "tegbe-institucional",
          subtype: "call-to-action"
        }
      }
    });

    if (dbData && dbData.values) {
      initialData = dbData.values;
    }
  } catch (error) {
    console.error("Erro ao buscar dados do Hero no servidor:", error);
  }

  return <HeroClientLayout initialData={initialData} initialTheme="ecommerce" />;
}