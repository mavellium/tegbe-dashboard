/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";

/**
 * Upload de arquivos usando Vercel Blob
 */
async function uploadToBlob(file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name}`;

  const blob = await put(filename, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: file.type,
  });

  return blob.url;
}

/**
 * Parser do FormData mantendo compatibilidade
 */
async function parseFormData(form: FormData): Promise<any[]> {
  const values: any[] = [];
  const fileFields: Record<string, File> = {};

  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      fileFields[key] = value;
      continue;
    }

    if (!key.startsWith("values[")) continue;

    const match = key.match(/values\[(\d+)\]\[(\w+)\](?:\[(\d+)\])?/);
    if (!match) continue;

    const index = Number(match[1]);
    const field = match[2];
    const arrayIndex = match[3];

    if (!values[index]) values[index] = {};

    if (arrayIndex !== undefined) {
      if (!Array.isArray(values[index][field])) {
        values[index][field] = [];
      }
      values[index][field][Number(arrayIndex)] = value;
    } else {
      values[index][field] = value;
    }
  }

  for (const [key, file] of Object.entries(fileFields)) {
    if (!file || file.size === 0) continue;

    const url = await uploadToBlob(file);

    const imageMatch = key.match(/file(\d+)/);
    const videoMatch = key.match(/video(\d+)/);

    if (imageMatch) {
      const index = Number(imageMatch[1]);
      values[index] ??= {};
      values[index].image = url;
    }

    if (videoMatch) {
      const index = Number(videoMatch[1]);
      values[index] ??= {};
      values[index].video = url;
    }
  }

  return values;
}

/**
 * POST — cria novo registro
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ type: string; subtype: string }> }
) {
  try {
    const { type, subtype } = await context.params;

    const form = await req.formData();
    const values = await parseFormData(form);

    const created = await prisma.formData.create({
      data: { type, subtype, values },
    });

    return NextResponse.json(created);
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

/**
 * GET — lista por type + subtype
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string; subtype: string }> }
) {
  try {
    const { type, subtype } = await context.params;

    const list = await prisma.formData.findMany({
      where: { type, subtype },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}

/**
 * PUT — atualiza por ID
 */
export async function PUT(req: NextRequest) {
  try {
    const form = await req.formData();
    const id = form.get("id")?.toString();

    if (!id) {
      return NextResponse.json({ error: "ID não enviado" }, { status: 400 });
    }

    const values = await parseFormData(form);

    const updated = await prisma.formData.update({
      where: { id },
      data: { values },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT ERROR:", err);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

/**
 * DELETE — remove por ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID não enviado" }, { status: 400 });
    }

    await prisma.formData.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
