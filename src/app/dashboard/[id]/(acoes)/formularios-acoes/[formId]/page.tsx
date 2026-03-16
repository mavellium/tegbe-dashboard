import VisualFormBuilderLayout from '@/layout/VisualFormBuilderLayout/page';
import prisma from '@/lib/prisma';

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;

  const componentData = await prisma.component.findUnique({
    where: { id },
  });

  const initialConfig = componentData?.config 
    ? JSON.parse(JSON.stringify(componentData.config)) 
    : null;

  const initialName = componentData?.name || "Novo Formulário";

  return (
    <VisualFormBuilderLayout 
      initialId={id} 
      initialConfig={initialConfig} 
      initialName={initialName}
    />
  );
}