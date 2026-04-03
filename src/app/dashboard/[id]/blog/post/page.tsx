import PostEditor from "@/components/PostEditor"; // Ajuste o caminho se precisar
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Página para criar NOVOS posts (só tem o parâmetro 'id' do tenant)
export default async function NewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: subCompanyId } = await params;

  // Busca apenas categorias e tags para o formulário
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  // Dados vazios para um novo post
  const initialData = {
    id: "",
    title: "",
    subtitle: "",
    body: "",
    excerpt: "",
    image: "",
    status: "DRAFT" as const,
    featured: false,
    categoryId: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800">
      <PostEditor 
        subCompanyId={subCompanyId} 
        initialData={initialData} // Dados vazios para novo post
        categories={categories} 
        tags={tags} 
        initialTagIds={[]} // Sem tags selecionadas inicialmente
      />
    </div>
  );
}