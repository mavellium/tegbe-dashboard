/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sharp from "sharp";

type JsonValue = Record<string, any>;

const AVIF_CONFIG = {
  quality: 80,
  effort: 5,
  chromaSubsampling: "4:4:4" as const,
};

async function deleteFromBunny(url: string): Promise<void> {
  try {
    const storageZone = process.env.BUNNY_STORAGE_ZONE!;
    const accessKey = process.env.BUNNY_ACCESS_KEY!;
    const host = process.env.BUNNY_HOST!;

    const urlParts = url.split(`https://${process.env.BUNNY_PULL_ZONE}/`);
    if (urlParts.length < 2) {
      return;
    }

    const filePath = urlParts[1];
    const deleteUrl = `https://${host}/${storageZone}/${filePath}`;

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'AccessKey': accessKey,
      },
    });

    if (!response.ok && response.status !== 404) {
      console.error(`Failed to delete file: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting file from Bunny:", error);
  }
}

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
    return {
      data: Buffer.from(arrayBuffer),
      filename: file.name,
    };
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

  const timestamp = Date.now();
  const fileName = `${timestamp}-${finalFilename.replace(/\s+/g, "-")}`;
  const fullPath = `${path}/${fileName}`;

  const uploadUrl = `https://${host}/${storageZone}/${fullPath}`;

  try {
    const uint8Array = new Uint8Array(finalBuffer);

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': accessKey,
        'Content-Type': contentType,
        'Content-Length': uint8Array.length.toString(),
      },
      body: uint8Array,
    });

    if (response.ok || response.status === 201) {
      const publicUrl = `https://${pullZone}/${fullPath}`;
      return publicUrl;
    } else {
      const errorText = await response.text();
      console.error("Erro no upload:", errorText);
      throw new Error(`Upload failed with status: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("Bunny CDN upload error:", error);
    throw error;
  }
}

function deepMerge(target: any, source: any): any {
  if (source == null) {
    return target;
  }
  
  if (target == null) {
    return source;
  }

  if (typeof target !== "object" || typeof source !== "object") {
    return source === undefined ? target : source;
  }

  if (Array.isArray(target) || Array.isArray(source)) {
    return source;
  }

  const output = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] === undefined) continue;

    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object"
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

async function handleUpsert(
  req: NextRequest,
  params: { type: string; subtype: string }
) {
  const { type, subtype } = params;

  const formData = await req.formData();

  const rawValues = formData.get("values");
  if (!rawValues) {
    console.error("Campo 'values' é obrigatório");
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

  const existingValues = existing?.values as JsonValue | null;
  const mergedValues: JsonValue = existingValues ? structuredClone(existingValues) : {};

  const finalValues = deepMerge(mergedValues, incomingValues);

  const oldUrls: string[] = [];
  if (existingValues) {
    const findUrls = (obj: any) => {
      if (typeof obj === 'string' && obj.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
        oldUrls.push(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach((value: any) => findUrls(value));
      }
    };
    findUrls(existingValues);
  }

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("file:")) continue;
    if (!(value instanceof File) || value.size === 0) continue;
    
    const jsonPath = key.replace("file:", "").split(".");
    
    let oldUrl: string | undefined;
    try {
      let current = finalValues;
      for (const p of jsonPath) {
        if (current && typeof current === 'object' && p in current) {
          current = current[p];
        } else {
          current = undefined;
          break;
        }
      }
      if (typeof current === 'string' && current.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
        oldUrl = current;
      }
    } catch (error) {
      console.error("Error finding old URL:", error);
    }

    if (oldUrl) {
      await deleteFromBunny(oldUrl);
    }

    const url = await uploadToBunnyWithConversion(value, `${type}/${subtype}`);

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

  const newUrls: string[] = [];
  const findNewUrls = (obj: any) => {
    if (typeof obj === 'string' && obj.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
      newUrls.push(obj);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach((value: any) => findNewUrls(value));
    }
  };
  findNewUrls(finalValues);

  const urlsToDelete = oldUrls.filter(url => !newUrls.includes(url));

  for (const url of urlsToDelete) {
    await deleteFromBunny(url);
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ subtype: string; type: string }> }
) {
  try {
    const { subtype, type } = await params;

    const existingData = await prisma.formData.findUnique({
      where: {
        type_subtype: {
          type,
          subtype,
        },
      },
    });

    if (existingData?.values) {
      const values = existingData.values as JsonValue;
      const findAndDeleteUrls = async (obj: any) => {
        if (typeof obj === 'string' && obj.startsWith(`https://${process.env.BUNNY_PULL_ZONE}`)) {
          await deleteFromBunny(obj);
        } else if (typeof obj === 'object' && obj !== null) {
          for (const value of Object.values(obj)) {
            await findAndDeleteUrls(value);
          }
        }
      };
      await findAndDeleteUrls(values);
    }

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