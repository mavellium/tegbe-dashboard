/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";

const AVIF_CONFIG = { quality: 80, effort: 5, chromaSubsampling: "4:4:4" as const };

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
    const subCompanies = await prisma.subCompany.findMany({ 
      include: { company: true }, 
      orderBy: { createdAt: "desc" } 
    });
    return NextResponse.json(subCompanies);
  } catch (error: any) { 
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // toString() explícito para garantir que o FormData extraia como string
    const name = formData.get("name")?.toString();
    const companyId = formData.get("companyId")?.toString();
    const description = formData.get("description")?.toString() || null;
    const ga_id = formData.get("ga_id")?.toString() || null;
    
    // JSONs
    const rawTheme = formData.get("theme")?.toString() || null;
    const rawMenuItems = formData.get("menuItems")?.toString() || null;

    const file = formData.get("file:logo_img") as File | null;
    const logoUrlStr = formData.get("logo_img")?.toString() || null;

    if (!name || !companyId) return NextResponse.json({ error: "Nome e Empresa são obrigatórios" }, { status: 400 });

    let themeJson = null;
    let menuItemsJson = null;

    if (rawTheme && rawTheme.trim() !== "") {
      try { themeJson = JSON.parse(rawTheme); } 
      catch (e) { return NextResponse.json({ error: "JSON do Tema inválido" }, { status: 400 }); }
    }

    if (rawMenuItems && rawMenuItems.trim() !== "") {
      try { menuItemsJson = JSON.parse(rawMenuItems); } 
      catch (e) { return NextResponse.json({ error: "JSON do Menu inválido" }, { status: 400 }); }
    }

    let finalLogoUrl = logoUrlStr;
    if (file && file.size > 0) {
      finalLogoUrl = await uploadToBunnyWithConversion(file, "subcompanies/logos");
    }

    const subCompany = await prisma.subCompany.create({
      data: { 
        name, 
        companyId, 
        description, 
        ga_id, 
        logo_img: finalLogoUrl,
        theme: themeJson, 
        menuItems: menuItemsJson 
      }
    });
    
    return NextResponse.json(subCompany, { status: 201 });
  } catch (error: any) {
    console.error("Erro POST SubCompany:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}