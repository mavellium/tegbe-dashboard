import HeroImagesClientLayout from "@/layout/HeroImagesClientLayout";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HeroImagesPage() {
  let initialData = null;
  try {
    const dbData = await prisma.formData.findUnique({
      where: {
        type_subtype: {
          type: "tegbe-institucional",
          subtype: "hero-images"
        }
      }
    });

    if (dbData && dbData.values) {
      initialData = dbData.values;
    }
  } catch (error) {
    console.error("Erro ao buscar dados das Hero Images no servidor:", error);
  }

  return <HeroImagesClientLayout initialData={initialData} initialTheme={"marketing"} />;
}