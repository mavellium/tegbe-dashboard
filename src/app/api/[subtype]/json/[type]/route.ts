/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import prisma from "@/lib/prisma";
import sharp from "sharp";

/* =========================================================
   TIPAGEM GENÉRICA
========================================================= */
type JsonValue = Record<string, any>;

/* =========================================================
   CONFIGURAÇÕES DE CONVERSÃO AVIF
========================================================= */
const AVIF_CONFIG = {
  quality: 80,
  effort: 5,
  chromaSubsampling: "4:4:4" as const,
};

/* =========================================================
   FUNÇÃO DE CONVERSÃO PARA AVIF
========================================================= */
async function convertToAvif(file: File): Promise<{ data: Buffer; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const avifBuffer = await sharp(arrayBuffer)
      .avif(AVIF_CONFIG)
      .toBuffer();
    
    const originalName = file.name.replace(/\.[^/.]+$/, "");
    const avifFilename = `${originalName}.avif`;
    
    return {
      data: avifBuffer,
      filename: avifFilename,
    };
  } catch (error) {
    console.error("Erro na conversão AVIF:", error);
    // Em caso de erro, retornar o arquivo original
    return {
      data: Buffer.from(arrayBuffer),
      filename: file.name,
    };
  }
}

/* =========================================================
   UPLOAD HELPER COM CONVERSÃO AUTOMÁTICA
========================================================= */
async function uploadToBlob(file: File): Promise<string> {
  let finalBuffer: any;
  let finalFilename: string;
  let contentType = file.type;

  const isImage = file.type.startsWith("image/");
  const isAlreadyAvif = file.name.toLowerCase().endsWith(".avif") || file.type === "image/avif";

  if (isImage && !isAlreadyAvif) {
    try {
      const { data, filename } = await convertToAvif(file);
      finalBuffer = data;
      finalFilename = filename;
      contentType = "image/avif";
    } catch (error) {
      console.error("Falha na conversão, mantendo original:", error);
      const arrayBuffer = await file.arrayBuffer();
      finalBuffer = Buffer.from(arrayBuffer);
      finalFilename = file.name;
    }
  } else {
    const arrayBuffer = await file.arrayBuffer();
    finalBuffer = Buffer.from(arrayBuffer);
    finalFilename = file.name;
  }

  // Criar um Blob a partir do Buffer
  const blob = new Blob([finalBuffer], { type: contentType });

  const result = await put(`${Date.now()}-${finalFilename}`, blob, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN!,
    contentType,
  });

  return result.url;
}

/* =========================================================
   MERGE PROFUNDO (genérico)
========================================================= */
function deepMerge(target: any, source: any): any {
  if (typeof target !== "object" || typeof source !== "object") {
    return source ?? target;
  }

  const output = Array.isArray(target) ? [...target] : { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] === undefined) continue;

    if (
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object"
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

/* =========================================================
   HANDLER PRINCIPAL (POST / PUT)
========================================================= */
async function handleUpsert(
  req: NextRequest,
  params: { type: string; subtype: string }
) {
  const { type, subtype } = params;

  const formData = await req.formData();

  const rawValues = formData.get("values");
  if (!rawValues) {
    return NextResponse.json(
      { error: "Campo 'values' é obrigatório" },
      { status: 400 }
    );
  }

  const incomingValues: JsonValue = JSON.parse(rawValues as string);

  const existing = await prisma.formData.findUnique({
    where: {
      type_subtype: {
        type,
        subtype,
      },
    },
  });

  const mergedValues: JsonValue = existing?.values
    ? structuredClone(existing.values as JsonValue)
    : {};

  const finalValues = deepMerge(mergedValues, incomingValues);

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("file:")) continue;
    if (!(value instanceof File) || value.size === 0) continue;

    const jsonPath = key.replace("file:", "").split(".");
    const url = await uploadToBlob(value);

    let current = finalValues;
    jsonPath.forEach((p, index) => {
      if (index === jsonPath.length - 1) {
        current[p] = url;
      } else {
        current[p] ??= {};
        current = current[p];
      }
    });
  }

  const record = await prisma.formData.upsert({
    where: {
      type_subtype: {
        type,
        subtype,
      },
    },
    update: {
      values: finalValues,
    },
    create: {
      type,
      subtype,
      values: finalValues,
    },
  });

  return NextResponse.json(record.values);
}

/* =========================================================
   POST
========================================================= */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subtype: string; type: string }> }
) {
  try {
    return await handleUpsert(req, await params);
  } catch (err) {
    console.error("POST JSON ERROR:", err);
    return NextResponse.json(
      { error: "Erro ao salvar JSON" },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT
========================================================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ subtype: string; type: string }> }
) {
  try {
    return await handleUpsert(req, await params);
  } catch (err) {
    console.error("PUT JSON ERROR:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar JSON" },
      { status: 500 }
    );
  }
}

/* =========================================================
   GET
========================================================= */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ subtype: string; type: string }> }
) {
  try {
    const { subtype, type } = await params;

    const record = await prisma.formData.findUnique({
      where: {
        type_subtype: {
          type,
          subtype,
        },
      },
    });

    return NextResponse.json(record?.values ?? null);
  } catch (err) {
    console.error("GET JSON ERROR:", err);
    return NextResponse.json(
      { error: "Erro ao buscar JSON" },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE
========================================================= */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ subtype: string; type: string }> }
) {
  try {
    const { subtype, type } = await params;

    await prisma.formData.delete({
      where: {
        type_subtype: {
          type,
          subtype,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE JSON ERROR:", err);
    return NextResponse.json(
      { error: "Erro ao deletar JSON" },
      { status: 500 }
    );
  }
}