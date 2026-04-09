/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { triggerRevalidateAsync } from "@/lib/revalidate";

const AVIF_CONFIG = { quality: 80, effort: 5, chromaSubsampling: "4:4:4" as const };

function generateSlug(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function deleteFromBunny(url: string): Promise<void> {
  try {
    const storageZone = process.env.BUNNY_STORAGE_ZONE!;
    const accessKey = process.env.BUNNY_ACCESS_KEY!;
    const host = process.env.BUNNY_HOST!;
    const urlParts = url.split(`https://${process.env.BUNNY_PULL_ZONE}/`);
    if (urlParts.length < 2) return;
    const deleteUrl = `https://${host}/${storageZone}/${urlParts[1]}`;
    await fetch(deleteUrl, { method: 'DELETE', headers: { 'AccessKey': accessKey } });
  } catch (error) {}
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { include: { tag: true } },
        subCompany: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } }
      }
    });
    if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

    // Função auxiliar: Se veio "", transforma em null pro Prisma não quebrar
    const getOptionalString = (key: string, fallback: string | null) => {
      if (!formData.has(key)) return fallback;
      const val = formData.get(key)?.toString();
      return val && val.trim() !== "" ? val : null;
    };

    // Dados obrigatórios: Se não vieram, mantemos os do banco (útil na Edição Rápida)
    const title = formData.get("title")?.toString() || existing.title;
    const body = formData.get("body")?.toString() || existing.body;
    const status = formData.get("status")?.toString() || existing.status;
    const subCompanyId = formData.get("subCompanyId")?.toString() || existing.subCompanyId;

    // Dados opcionais blindados contra ""
    const subtitle = getOptionalString("subtitle", existing.subtitle);
    const excerpt = getOptionalString("excerpt", existing.excerpt);
    const categoryId = getOptionalString("categoryId", existing.categoryId);
    const authorId = getOptionalString("authorId", existing.authorId);
    const authorName = getOptionalString("authorName", existing.authorName);
    const seoTitle = getOptionalString("seoTitle", existing.seoTitle);
    const seoDescription = getOptionalString("seoDescription", existing.seoDescription);
    const seoKeywords = getOptionalString("seoKeywords", existing.seoKeywords);

    let featured = existing.featured;
    if (formData.has("featured")) featured = formData.get("featured")?.toString() === "true";

    const rawTagIds = formData.get("tagIds")?.toString();
    const file = formData.get("file:image") as File | null;
    const imageUrlStr = formData.get("image")?.toString();

    let tagIds: string[] = [];
    if (rawTagIds) {
      try { tagIds = JSON.parse(rawTagIds); } catch (e) {}
    }

    let slug = existing.slug;
    if (title !== existing.title) {
      slug = generateSlug(title);
    }

    const readingTime = Math.ceil(body.split(/\s+/).length / 200);

    let publishedAt = existing.publishedAt;
    if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      publishedAt = new Date();
    }

    // Gerenciamento da Imagem
    let finalImageUrl = existing.image;
    if (file && file.size > 0) {
      if (finalImageUrl && finalImageUrl.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
        await deleteFromBunny(finalImageUrl);
      }
      finalImageUrl = await uploadToBunnyWithConversion(file, "blog/posts");
    } else if (imageUrlStr !== undefined) {
      if (imageUrlStr === "" || imageUrlStr === "null") {
        if (finalImageUrl && finalImageUrl.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
          await deleteFromBunny(finalImageUrl);
        }
        finalImageUrl = null;
      } else {
        finalImageUrl = imageUrlStr;
      }
    }

    // Se enviou tags (Edição Completa), recria a relação. Se não enviou (Edição Rápida), preserva.
    if (rawTagIds !== undefined) {
      await prisma.blogPostTag.deleteMany({ where: { postId: id } });
      if (tagIds.length > 0) {
        await prisma.blogPostTag.createMany({
          data: tagIds.map(tagId => ({ postId: id, tagId }))
        });
      }
    }

    try {
      const post = await prisma.blogPost.update({
        where: { id },
        data: {
          title, subtitle, slug, body, excerpt, image: finalImageUrl,
          status: status as any, featured, readingTime, publishedAt,
          categoryId, subCompanyId, authorId, authorName,
          seoTitle, seoDescription, seoKeywords
        },
        include: {
          category: true,
          tags: { include: { tag: true } },
          subCompany: { select: { id: true, name: true } }
        }
      });
      // Revalida slug novo e antigo (caso o título tenha mudado) + índice do blog
      triggerRevalidateAsync({ slugs: [slug, existing.slug, "blog"] });
      return NextResponse.json(post);
    } catch (e: any) {
      if (e.code === "P2002") {
        slug = `${slug}-${Date.now()}`;
        const post = await prisma.blogPost.update({
          where: { id },
          data: {
            title, subtitle, slug, body, excerpt, image: finalImageUrl,
            status: status as any, featured, readingTime, publishedAt,
            categoryId, subCompanyId, authorId, authorName,
            seoTitle, seoDescription, seoKeywords
          }
        });
        triggerRevalidateAsync({ slugs: [slug, existing.slug, "blog"] });
        return NextResponse.json(post);
      }
      throw e;
    }
  } catch (error: any) {
    console.error("Erro PUT BlogPost:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.blogPost.findUnique({ where: { id } });

    if (existing?.image && existing.image.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
      await deleteFromBunny(existing.image);
    }

    await prisma.blogPost.delete({ where: { id } });
    if (existing?.slug) {
      triggerRevalidateAsync({ slugs: [existing.slug, "blog"] });
    } else {
      triggerRevalidateAsync({ slug: "blog" });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}