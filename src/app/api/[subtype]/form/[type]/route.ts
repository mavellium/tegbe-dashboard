/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { triggerRevalidateAsync } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/* =========================================================
   Função para extrair sugestões de todos os logos
========================================================= */
async function getSuggestionsFromAllLogos() {
  try {
    const allLogosRecords = await prisma.formData.findMany({
      where: {
        type: { startsWith: 'logos' },
      },
    });

    const categories = new Set<string>();
    const companies: any[] = [];

    allLogosRecords.forEach(record => {
      const values = record.values as any[];
      if (Array.isArray(values)) {
        values.forEach(item => {
          if (item.category?.trim()) categories.add(item.category.trim());
          if (item.name?.trim()) {
            const exists = companies.find(c => c.name.toLowerCase() === item.name.toLowerCase());
            if (!exists) {
              companies.push({
                name: item.name.trim(),
                image: item.image,
                description: item.description,
                category: item.category,
              });
            }
          }
        });
      }
    });

    return {
      categories: Array.from(categories).sort(),
      companies: companies.sort((a, b) => a.name.localeCompare(b.name)),
    };
  } catch (error) {
    return { categories: [], companies: [] };
  }
}

/* =========================================================
   Helpers Bunny CDN (delete e upload mantidos)
========================================================= */
async function deleteFromBunny(url: string): Promise<void> {
  try {
    const urlParts = url.split(`https://${process.env.BUNNY_PULL_ZONE}/`);
    if (urlParts.length < 2) return;
    const uploadUrl = `https://${process.env.BUNNY_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${urlParts[1]}`;
    await fetch(uploadUrl, { method: 'DELETE', headers: { 'AccessKey': process.env.BUNNY_ACCESS_KEY! } });
  } catch (e) {}
}

async function uploadToBunny(file: File, path: string = "uploads"): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const fullPath = `${path}/${fileName}`;
  const uploadUrl = `https://${process.env.BUNNY_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${fullPath}`;

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'AccessKey': process.env.BUNNY_ACCESS_KEY!, 'Content-Type': file.type },
    body: await file.arrayBuffer(),
  });

  if (response.ok || response.status === 201) return `https://${process.env.BUNNY_PULL_ZONE}/${fullPath}`;
  throw new Error("Upload failed");
}

/* =========================================================
   Lógica de UPSERT Corrigida (findFirst + Manual Update/Create)
========================================================= */
async function handleUpsert(req: NextRequest, context: { params: Promise<{ type: string; subtype: string }> }) {
  const { type, subtype } = await context.params;
  const form = await req.formData();
  const rawValues = form.get("values");
  const safeValues = rawValues ? JSON.parse(rawValues as string) : [];

  // 1. CORREÇÃO: findFirst para evitar o erro de type_subtype
  const existingData = await prisma.formData.findFirst({
    where: { type, subtype }
  });

  // Processar uploads
  for (let i = 0; i < safeValues.length; i++) {
    const file = form.get(`file${i}`) as File | null;
    if (file && file.size > 0) {
      const existingValues = existingData?.values as any[] | undefined;
      if (existingValues?.[i]?.image) await deleteFromBunny(existingValues[i].image);

      const url = await uploadToBunny(file, `${type}/${subtype}`);
      safeValues[i].image = url;
    } else {
      const existingValues = existingData?.values as any[] | undefined;
      if (existingValues?.[i]?.image) safeValues[i].image = existingValues[i].image;
    }
  }

  // 2. CORREÇÃO: Update ou Create manual em vez de upsert
  let record;
  if (existingData) {
    record = await prisma.formData.update({
      where: { id: existingData.id },
      data: { values: safeValues }
    });
  } else {
    record = await prisma.formData.create({
      data: { type, subtype, values: safeValues }
    });
  }

  triggerRevalidateAsync({ slug: type });
  return NextResponse.json(record);
}

export async function POST(req: NextRequest, ctx: any) { return handleUpsert(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return handleUpsert(req, ctx); }

export async function GET(req: NextRequest, context: { params: Promise<{ type: string; subtype: string }> }) {
  const { type, subtype } = await context.params;
  const { searchParams } = new URL(req.url);
  const includeSuggestions = searchParams.get('suggestions') === 'true';

  // CORREÇÃO: findFirst
  const record = await prisma.formData.findFirst({
    where: { type, subtype }
  });

  let suggestions = null;
  if (type.startsWith('logos') && includeSuggestions) {
    suggestions = await getSuggestionsFromAllLogos();
  }

  return NextResponse.json({ ...record, suggestions }, { headers: NO_STORE_HEADERS });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ type: string; subtype: string }> }) {
  const { type, subtype } = await context.params;
  try {
    // CORREÇÃO: findFirst
    const existingData = await prisma.formData.findFirst({
      where: { type, subtype }
    });

    if (existingData) {
      const values = existingData.values as any[] | undefined;
      if (values) {
        for (const item of values) {
          if (item.image) await deleteFromBunny(item.image);
        }
      }
      // Deleta pelo ID único gerado pelo banco
      await prisma.formData.delete({ where: { id: existingData.id } });
    }

    triggerRevalidateAsync({ slug: type });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}