/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";

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
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } }
    });
    if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString() || null;
    const seoTitle = formData.get("seoTitle")?.toString() || null;
    const seoDescription = formData.get("seoDescription")?.toString() || null;
    const seoKeywords = formData.get("seoKeywords")?.toString() || null;

    const file = formData.get("file:image") as File | null;
    
    const imageUrlStr = formData.get("image")?.toString();

    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

    let slug = existing.slug;
    if (name !== existing.name) {
      slug = generateSlug(name);
    }

    let finalImageUrl = existing.image;

    if (file && file.size > 0) {
      if (finalImageUrl && finalImageUrl.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
        await deleteFromBunny(finalImageUrl);
      }
      finalImageUrl = await uploadToBunnyWithConversion(file, "blog/categories");
    } 
    else if (imageUrlStr !== undefined) {
      if (imageUrlStr === "" || imageUrlStr === "null") {
        if (finalImageUrl && finalImageUrl.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
          await deleteFromBunny(finalImageUrl);
        }
        finalImageUrl = null;
      } else {
        finalImageUrl = imageUrlStr;
      }
    }

    try {
      const category = await prisma.blogCategory.update({
        where: { id },
        data: { name, slug, description, image: finalImageUrl, seoTitle, seoDescription, seoKeywords }
      });
      return NextResponse.json(category);
    } catch (e: any) {
      if (e.code === "P2002") {
        slug = `${slug}-${Date.now()}`;
        const category = await prisma.blogCategory.update({
          where: { id },
          data: { name, slug, description, image: finalImageUrl, seoTitle, seoDescription, seoKeywords }
        });
        return NextResponse.json(category);
      }
      throw e;
    }
  } catch (error: any) {
    console.error("Erro PUT BlogCategory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.blogCategory.findUnique({ where: { id } });

    if (existing?.image && existing.image.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
      await deleteFromBunny(existing.image);
    }

    await prisma.blogCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}