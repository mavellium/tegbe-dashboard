/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";

type JsonValue = Record<string, any>;
const AVIF_CONFIG = { quality: 80, effort: 5, chromaSubsampling: "4:4:4" as const };

async function deleteFromBunny(url: string): Promise<void> {
  // Lógica inalterada...
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
  // Lógica inalterada...
  const arrayBuffer = await file.arrayBuffer();
  try {
    const avifBuffer = await sharp(arrayBuffer).avif(AVIF_CONFIG).toBuffer();
    return { data: avifBuffer, filename: `${file.name.replace(/\.[^/.]+$/, "")}.avif` };
  } catch (error) { return { data: Buffer.from(arrayBuffer), filename: file.name }; }
}

async function uploadToBunnyWithConversion(file: File, path: string = "uploads"): Promise<string> {
  // Lógica inalterada...
  let finalBuffer: Buffer, finalFilename: string, contentType = file.type;
  if (file.type.startsWith("image/") && !file.name.toLowerCase().endsWith(".avif") && file.type !== "image/avif") {
    try { const { data, filename } = await convertToAvif(file); finalBuffer = data; finalFilename = filename; contentType = "image/avif"; } 
    catch (e) { finalBuffer = Buffer.from(await file.arrayBuffer()); finalFilename = file.name; }
  } else { finalBuffer = Buffer.from(await file.arrayBuffer()); finalFilename = file.name; }
  
  const fullPath = `${path}/${Date.now()}-${finalFilename.replace(/\s+/g, "-")}`;
  const uploadUrl = `https://${process.env.BUNNY_HOST!}/${process.env.BUNNY_STORAGE_ZONE!}/${fullPath}`;
  
  const response = await fetch(uploadUrl, {
    method: 'PUT', headers: { 'AccessKey': process.env.BUNNY_ACCESS_KEY!, 'Content-Type': contentType, 'Content-Length': finalBuffer.length.toString() },
    body: new Uint8Array(finalBuffer),
  });

  if (response.ok || response.status === 201) return `https://${process.env.BUNNY_PULL_ZONE!}/${fullPath}`;
  throw new Error(`Upload failed`);
}

function deepMerge(target: any, source: any): any {
  // Lógica inalterada...
  if (source == null) return target;
  if (target == null) return source;
  if (typeof target !== "object" || typeof source !== "object") return source === undefined ? target : source;
  if (Array.isArray(target) || Array.isArray(source)) return source;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] === undefined) continue;
    if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key]) && target[key] && typeof target[key] === "object") {
      output[key] = deepMerge(target[key], source[key]);
    } else { output[key] = source[key]; }
  }
  return output;
}

async function handleUpsert(req: NextRequest, params: { type: string; subtype: string }) {
  const { type, subtype } = params;
  const formData = await req.formData();
  const rawValues = formData.get("values");
  if (!rawValues) return NextResponse.json({ error: "Campo 'values' é obrigatório" }, { status: 400 });

  const incomingValues: JsonValue = JSON.parse(rawValues as string);

  // CORREÇÃO: findFirst ao invés do type_subtype único
  const existing = await prisma.formData.findFirst({
    where: { type, subtype },
  });

  const existingValues = existing?.values as JsonValue | null;
  const mergedValues: JsonValue = existingValues ? structuredClone(existingValues) : {};
  const finalValues = deepMerge(mergedValues, incomingValues);

  const oldUrls: string[] = [];
  if (existingValues) {
    const findUrls = (obj: any) => {
      if (typeof obj === 'string' && obj.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) oldUrls.push(obj);
      else if (typeof obj === 'object' && obj !== null) Object.values(obj).forEach((value: any) => findUrls(value));
    };
    findUrls(existingValues);
  }

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("file:") || !(value instanceof File) || value.size === 0) continue;
    const jsonPath = key.replace("file:", "").split(".");
    
    let oldUrl: string | undefined;
    try {
      let current = finalValues;
      for (const p of jsonPath) {
        if (current && typeof current === 'object' && p in current) current = current[p];
        else { current = undefined; break; }
      }
      if (typeof current === 'string' && current.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) oldUrl = current;
    } catch (e) {}

    if (oldUrl) await deleteFromBunny(oldUrl);

    const url = await uploadToBunnyWithConversion(value, `${type}/${subtype}`);

    let current = finalValues;
    jsonPath.forEach((p, index) => {
      if (index === jsonPath.length - 1) current[p] = url;
      else { current[p] ??= {}; current = current[p]; }
    });
  }

  const newUrls: string[] = [];
  const findNewUrls = (obj: any) => {
    if (typeof obj === 'string' && obj.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) newUrls.push(obj);
    else if (typeof obj === 'object' && obj !== null) Object.values(obj).forEach((value: any) => findNewUrls(value));
  };
  findNewUrls(finalValues);

  const urlsToDelete = oldUrls.filter(url => !newUrls.includes(url));
  for (const url of urlsToDelete) await deleteFromBunny(url);

  // CORREÇÃO: Usar Update e Create manual em vez de Upsert para evitar conflito da chave antiga
  let record;
  if (existing) {
    record = await prisma.formData.update({
      where: { id: existing.id },
      data: { values: finalValues },
    });
  } else {
    record = await prisma.formData.create({
      data: { type, subtype, values: finalValues },
    });
  }

  return NextResponse.json(record.values);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ subtype: string; type: string }> }) {
  try { return await handleUpsert(req, await params); } catch (err) { return NextResponse.json({ error: "Erro" }, { status: 500 }); }
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ subtype: string; type: string }> }) {
  try { return await handleUpsert(req, await params); } catch (err) { return NextResponse.json({ error: "Erro" }, { status: 500 }); }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ subtype: string; type: string }> }) {
  try {
    const { subtype, type } = await params;
    // CORREÇÃO: findFirst
    const record = await prisma.formData.findFirst({ where: { type, subtype } });
    return NextResponse.json(record?.values ?? null);
  } catch (err) { return NextResponse.json({ error: "Erro" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ subtype: string; type: string }> }) {
  try {
    const { subtype, type } = await params;
    // CORREÇÃO: findFirst
    const existingData = await prisma.formData.findFirst({ where: { type, subtype } });

    if (existingData?.values) {
      const values = existingData.values as JsonValue;
      const findAndDeleteUrls = async (obj: any) => {
        if (typeof obj === 'string' && obj.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) await deleteFromBunny(obj);
        else if (typeof obj === 'object' && obj !== null) {
          for (const value of Object.values(obj)) await findAndDeleteUrls(value);
        }
      };
      await findAndDeleteUrls(values);
      await prisma.formData.delete({ where: { id: existingData.id } });
    }
    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: "Erro" }, { status: 500 }); }
}