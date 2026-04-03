import prisma from '@/lib/prisma';
import BlogDashboardLayout from './BlogDashboardLayout';

interface BlogPostData {
  id: string;
  title: string;
  status: string;
  category?: { name: string } | null;
  updatedAt: string | Date;
  image?: string | null;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id: subCompanyId } = await params;

  // Busca inicial com paginação (primeira página) - usando Prisma diretamente
  let postsData: { posts: BlogPostData[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } = { posts: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };

  try {
    const where = { subCompanyId };
    const total = await prisma.blogPost.count({ where });
    
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 12,
      include: {
        category: { select: { name: true } },
        tags: { include: { tag: true } },
        subCompany: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } }
      }
    });

    const totalPages = Math.ceil(total / 12);
    postsData = {
      posts,
      pagination: {
        page: 1,
        limit: 12,
        total,
        totalPages,
        hasNext: totalPages > 1,
        hasPrev: false
      }
    };
  } catch {
    // Silencioso - erro tratado com dados padrão
  }

  // Busca de categorias e tags (sem paginação necessária)
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogTag.findMany({
      orderBy: { createdAt: "desc" },
    })
  ]);

  const serializedPosts = postsData.posts?.map((post: BlogPostData) => ({
    id: post.id,
    title: post.title,
    status: post.status,
    categoryName: post.category?.name || "Sem categoria",
    updatedAt: post.updatedAt.toString(),
    image: post.image || null, 
  })) || [];

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
      initialPagination={postsData.pagination}
    />
  );
}