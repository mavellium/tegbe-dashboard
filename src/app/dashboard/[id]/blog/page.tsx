import prisma from '@/lib/prisma';
import BlogDashboardLayout from './BlogDashboardLayout';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id: subCompanyId } = await params;

  // Busca inicial paralela para otimizar tempo
  const [posts, categories, tags] = await Promise.all([
    prisma.blogPost.findMany({
      where: { subCompanyId },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
      }
    }),
    prisma.blogCategory.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogTag.findMany({
      orderBy: { createdAt: "desc" },
    })
  ]);

  const serializedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    status: post.status,
    categoryName: post.category?.name || "Sem categoria",
    updatedAt: post.updatedAt.toISOString(),
    image: post.image || null, 
  }));

  const serializedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    image: cat.image,
    seoTitle: cat.seoTitle,
    seoDescription: cat.seoDescription,
    seoKeywords: cat.seoKeywords,
  }));

  const serializedTags = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    description: tag.description,
    image: tag.image,
    seoTitle: tag.seoTitle,
    seoDescription: tag.seoDescription,
    seoKeywords: tag.seoKeywords,
  }));

  return (
    <BlogDashboardLayout 
      subCompanyId={subCompanyId}
      initialPosts={serializedPosts}
      initialCategories={serializedCategories}
      initialTags={serializedTags}
    />
  );
}