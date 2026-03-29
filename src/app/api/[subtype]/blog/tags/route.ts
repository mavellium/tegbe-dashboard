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

export async function GET() {
  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { posts: true } } }
    });
    return NextResponse.json(tags);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString() || null;
    const seoTitle = formData.get("seoTitle")?.toString() || null;
    const seoDescription = formData.get("seoDescription")?.toString() || null;
    const seoKeywords = formData.get("seoKeywords")?.toString() || null;

    const file = formData.get("file:image") as File | null;
    
    const imageUrlStr = formData.get("image")?.toString() || null;

    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

    let slug = generateSlug(name);
    
    let imageUrl: string | null = imageUrlStr && imageUrlStr !== "" ? imageUrlStr : null;

    if (file && file.size > 0) {
      imageUrl = await uploadToBunnyWithConversion(file, "blog/tags");
    }

    try {
      const tag = await prisma.blogTag.create({
        data: { name, slug, description, image: imageUrl, seoTitle, seoDescription, seoKeywords }
      });
      return NextResponse.json(tag, { status: 201 });
    } catch (e: any) {
      if (e.code === "P2002") {
        slug = `${slug}-${Date.now()}`;
        const tag = await prisma.blogTag.create({
          data: { name, slug, description, image: imageUrl, seoTitle, seoDescription, seoKeywords }
        });
        return NextResponse.json(tag, { status: 201 });
      }
      throw e;
    }
  } catch (error: any) {
    console.error("Erro POST BlogTag:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}