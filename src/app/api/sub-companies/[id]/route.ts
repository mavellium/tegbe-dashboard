/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";

const AVIF_CONFIG = { quality: 80, effort: 5, chromaSubsampling: "4:4:4" as const };

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
    const subCompany = await prisma.subCompany.findUnique({
      where: { id },
      include: { company: true, formData: true }
    });
    if (!subCompany) return NextResponse.json({ error: "Sub-Empresa não encontrada" }, { status: 404 });
    return NextResponse.json(subCompany);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    
    const name = formData.get("name")?.toString();
    const companyId = formData.get("companyId")?.toString();
    const description = formData.get("description")?.toString() || null;
    const ga_id = formData.get("ga_id")?.toString() || null;
    
    const rawTheme = formData.get("theme")?.toString() || null;
    const rawMenuItems = formData.get("menuItems")?.toString() || null;
    
    console.log(`[DEBUG API PUT] Filial ID: ${id}`);
    
    const file = formData.get("file:logo_img") as File | null;
    const logoUrlStr = formData.get("logo_img")?.toString() || null;

    if (!name || !companyId) {
      return NextResponse.json({ error: "Nome e Empresa são obrigatórios" }, { status: 400 });
    }

    let themeJson = null;
    let menuItemsJson = null;

    if (rawTheme && rawTheme.trim() !== "") {
      try { themeJson = JSON.parse(rawTheme); } 
      catch (e) { return NextResponse.json({ error: "JSON do Tema com sintaxe inválida." }, { status: 400 }); }
    }

    if (rawMenuItems && rawMenuItems.trim() !== "") {
      try { menuItemsJson = JSON.parse(rawMenuItems); } 
      catch (e) { return NextResponse.json({ error: "JSON do Menu com sintaxe inválida." }, { status: 400 }); }
    }

    const existingSubCompany = await prisma.subCompany.findUnique({ where: { id } });
    if (!existingSubCompany) {
      return NextResponse.json({ error: "Filial não encontrada" }, { status: 404 });
    }

    let finalLogoUrl = existingSubCompany.logo_img;

    if (file && file.size > 0) {
      if (finalLogoUrl && finalLogoUrl.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
        await deleteFromBunny(finalLogoUrl);
      }
      finalLogoUrl = await uploadToBunnyWithConversion(file, "subcompanies/logos");
    } 
    else if (logoUrlStr === "" || logoUrlStr === null) {
      if (finalLogoUrl && finalLogoUrl.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
        await deleteFromBunny(finalLogoUrl);
      }
      finalLogoUrl = null;
    }

    const subCompany = await prisma.subCompany.update({
      where: { id },
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
    
    return NextResponse.json(subCompany);
  } catch (error: any) {
    console.error("[ERRO FATAL PUT SUBCOMPANY]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existingSubCompany = await prisma.subCompany.findUnique({ where: { id } });
    
    if (existingSubCompany?.logo_img && existingSubCompany.logo_img.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
        await deleteFromBunny(existingSubCompany.logo_img);
    }

    await prisma.subCompany.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}