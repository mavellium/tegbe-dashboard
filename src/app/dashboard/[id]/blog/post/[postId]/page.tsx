import PostEditor from "@/components/PostEditor"; 
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string, postId: string }> }) {
  const { id: subCompanyId, postId } = await params;

  const [post, categories, tags] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        tags: true,
      }
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

  if (!post) {
    notFound();
  }

  const initialData = {
    id: post.id,
    title: post.title,
    subtitle: post.subtitle || "",
    body: post.body,
    excerpt: post.excerpt || "",
    image: post.image || "",
    video: "", // Temporariamente vazio até adicionar ao banco
    status: post.status as "DRAFT" | "PUBLISHED" | "ARCHIVED", 
    featured: post.featured,
    categoryId: post.categoryId || "",
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    seoKeywords: post.seoKeywords || "",
    authorId: post.authorId || "",
    authorName: post.authorName || "",
  };

  const initialTagIds = post.tags.map(t => t.tagId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800">
      <PostEditor 
        subCompanyId={subCompanyId} 
        initialData={initialData}
        categories={categories} 
        tags={tags} 
        initialTagIds={initialTagIds}
      />
    </div>
  );
}