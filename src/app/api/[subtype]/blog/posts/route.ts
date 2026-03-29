/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";

const AVIF_CONFIG = { quality: 80, effort: 5, chromaSubsampling: "4:4:4" as const };

function generateSlug(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function convertToAvif(file: File): Promise<{ data: Buffer; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const avifBuffer = await sharp(arrayBuffer).avif(AVIF_CONFIG).toBuffer();
    const originalName = file.name.replace(/\.[^/.]+$/, "");
    return { data: avifBuffer, filename: `${originalName}.avif` };
  } catch (error) {
    return { data: Buffer.from(arrayBuffer), filename: file.name };
  }
}

async function uploadToBunnyWithConversion(file: File, path: string = "uploads"): Promise<string> {
  let finalBuffer: Buffer;
  let finalFilename: string;
  let contentType = file.type;

  const storageZone = process.env.BUNNY_STORAGE_ZONE!;
  const accessKey = process.env.BUNNY_ACCESS_KEY!;
  const host = process.env.BUNNY_HOST!;
  const pullZone = process.env.BUNNY_PULL_ZONE!;

  const isImage = file.type.startsWith("image/");
  const isAlreadyAvif = file.name.toLowerCase().endsWith(".avif") || file.type === "image/avif";

  if (isImage && !isAlreadyAvif) {
    try {
      const { data, filename } = await convertToAvif(file);
      finalBuffer = data; finalFilename = filename; contentType = "image/avif";
    } catch (e) {
      const arrayBuffer = await file.arrayBuffer();
      finalBuffer = Buffer.from(arrayBuffer); finalFilename = file.name;
    }
  } else {
    const arrayBuffer = await file.arrayBuffer();
    finalBuffer = Buffer.from(arrayBuffer); finalFilename = file.name;
  }

  const timestamp = Date.now();
  const fileName = `${timestamp}-${finalFilename.replace(/\s+/g, "-")}`;
  const fullPath = `${path}/${fileName}`;
  const uploadUrl = `https://${host}/${storageZone}/${fullPath}`;

  const uint8Array = new Uint8Array(finalBuffer);
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'AccessKey': accessKey, 'Content-Type': contentType, 'Content-Length': uint8Array.length.toString() },
    body: uint8Array,
  });

  if (response.ok || response.status === 201) return `https://${pullZone}/${fullPath}`;
  throw new Error(`Upload failed: ${response.status}`);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subCompanyId = searchParams.get("subCompanyId");
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    const where: any = {};
    if (subCompanyId) where.subCompanyId = subCompanyId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (featured) where.featured = featured === "true";

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        tags: { include: { tag: true } },
        subCompany: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } }
      }
    });
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = formData.get("title")?.toString();
    const subtitle = formData.get("subtitle")?.toString() || null;
    const body = formData.get("body")?.toString();
    const excerpt = formData.get("excerpt")?.toString() || null;
    const status = formData.get("status")?.toString() || "DRAFT";
    const featured = formData.get("featured")?.toString() === "true";
    const categoryId = formData.get("categoryId")?.toString() || null;
    const subCompanyId = formData.get("subCompanyId")?.toString();
    const authorId = formData.get("authorId")?.toString() || null;
    const authorName = formData.get("authorName")?.toString() || null;
    const seoTitle = formData.get("seoTitle")?.toString() || null;
    const seoDescription = formData.get("seoDescription")?.toString() || null;
    const seoKeywords = formData.get("seoKeywords")?.toString() || null;
    const rawTagIds = formData.get("tagIds")?.toString() || "[]";

    const file = formData.get("file:image") as File | null;
    // Captura a URL da imagem enviada pelo componente frontend
    const imageUrlStr = formData.get("image")?.toString() || null;

    if (!title || !body || !subCompanyId) {
      return NextResponse.json({ error: "Título, corpo e filial são obrigatórios" }, { status: 400 });
    }

    let tagIds: string[] = [];
    try { tagIds = JSON.parse(rawTagIds); } catch (e) {}

    let slug = generateSlug(title);
    const readingTime = Math.ceil(body.split(/\s+/).length / 200);
    const publishedAt = status === "PUBLISHED" ? new Date() : null;

    // Inicia com a string que veio do frontend
    let imageUrl: string | null = imageUrlStr && imageUrlStr !== "" ? imageUrlStr : null;

    // Apenas se mandou um arquivo físico (fallback)
    if (file && file.size > 0) {
      imageUrl = await uploadToBunnyWithConversion(file, "blog/posts");
    }

    try {
      const post = await prisma.blogPost.create({
        data: {
          title, subtitle, slug, body, excerpt, image: imageUrl,
          status: status as any, featured, readingTime, publishedAt,
          categoryId, subCompanyId, authorId, authorName,
          seoTitle, seoDescription, seoKeywords
        }
      });

      if (tagIds.length > 0) {
        await prisma.blogPostTag.createMany({
          data: tagIds.map(tagId => ({ postId: post.id, tagId }))
        });
      }

      const fullPost = await prisma.blogPost.findUnique({
        where: { id: post.id },
        include: { category: true, tags: { include: { tag: true } }, subCompany: { select: { id: true, name: true } } }
      });

      return NextResponse.json(fullPost, { status: 201 });
    } catch (e: any) {
      if (e.code === "P2002") {
        slug = `${slug}-${Date.now()}`;
        const post = await prisma.blogPost.create({
          data: {
            title, subtitle, slug, body, excerpt, image: imageUrl,
            status: status as any, featured, readingTime, publishedAt,
            categoryId, subCompanyId, authorId, authorName,
            seoTitle, seoDescription, seoKeywords
          }
        });

        if (tagIds.length > 0) {
          await prisma.blogPostTag.createMany({
            data: tagIds.map(tagId => ({ postId: post.id, tagId }))
          });
        }

        return NextResponse.json(post, { status: 201 });
      }
      throw e;
    }
  } catch (error: any) {
    console.error("Erro POST BlogPost:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}