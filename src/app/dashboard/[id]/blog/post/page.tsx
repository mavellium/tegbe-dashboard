import PostEditor from "@/components/PostEditor"; // Ajuste o caminho se precisar
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// OLHA AQUI OS DOIS PARÂMETROS DA URL! 'id' (tenant) e 'postId' (post)
export default async function EditPostPage({ params }: { params: Promise<{ id: string, postId: string }> }) {
  const { id: subCompanyId, postId } = await params;

  // Busca o post específico, as categorias e as tags
  const [post, categories, tags] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id: postId },
      include: { tags: true } // Traz a relação das tags para marcar no front
    }),
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  // Se a URL estiver com um ID de post que não existe, dá página 404
  if (!post) {
    notFound();
  }

  // Empacota os dados para enviar ao Client Component
  const initialData = {
    id: post.id,
    title: post.title,
    subtitle: post.subtitle || "",
    body: post.body,
    excerpt: post.excerpt || "",
    image: post.image || "",
    status: post.status,
    featured: post.featured,
    categoryId: post.categoryId || "",
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    seoKeywords: post.seoKeywords || "",
  };

  const initialTagIds = post.tags.map(t => t.tagId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800">
      <PostEditor 
        subCompanyId={subCompanyId} 
        initialData={initialData} // AQUI VAI O ID DO POST PRO EDITOR!
        categories={categories} 
        tags={tags} 
        initialTagIds={initialTagIds}
      />
    </div>
  );
}