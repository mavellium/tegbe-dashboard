/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* =========================================================
   Função para extrair sugestões de todos os logos
========================================================= */
async function getSuggestionsFromAllLogos() {
  try {
    // Buscar todos os registros onde type começa com "logos"
    const allLogosRecords = await prisma.formData.findMany({
      where: {
        type: {
          startsWith: 'logos',
        },
      },
    });

    const categories = new Set<string>();
    const companies: Array<{
      name: string;
      image?: string;
      description?: string;
      category?: string;
    }> = [];

    // Extrair categorias e empresas únicas
    allLogosRecords.forEach(record => {
      const values = record.values as any[];
      if (Array.isArray(values)) {
        values.forEach(item => {
          // Adicionar categoria
          if (item.category && typeof item.category === 'string' && item.category.trim()) {
            categories.add(item.category.trim());
          }

          // Adicionar empresa se tiver nome
          if (item.name && typeof item.name === 'string' && item.name.trim()) {
            const existingCompany = companies.find(c => 
              c.name.toLowerCase() === item.name.toLowerCase()
            );
            
            if (!existingCompany) {
              companies.push({
                name: item.name.trim(),
                image: item.image || undefined,
                description: item.description || undefined,
                category: item.category || undefined,
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
    console.error("❌ Error extracting suggestions:", error);
    return { categories: [], companies: [] };
  }
}

/* =========================================================
   Upload helper para Bunny CDN
========================================================= */
async function uploadToBunny(file: File, path: string = "uploads"): Promise<string> {
  
  const storageZone = process.env.BUNNY_STORAGE_ZONE!;
  const accessKey = process.env.BUNNY_ACCESS_KEY!;
  const host = process.env.BUNNY_HOST!;
  const pullZone = process.env.BUNNY_PULL_ZONE!;

  // Nome único para o arquivo
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name.replace(/\s+/g, "-")}`;
  const fullPath = `${path}/${fileName}`;

  // Converter File para ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // URL para upload no Bunny CDN
  const uploadUrl = `https://${host}/${storageZone}/${fullPath}`;

  try {
    // Fazer upload para Bunny CDN usando fetch
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': accessKey,
        'Content-Type': file.type,
        'Content-Length': file.size.toString(),
      },
      body: arrayBuffer,
    });

    if (response.ok || response.status === 201) {
      // Retorna URL pública do arquivo
      const publicUrl = `https://${pullZone}/${fullPath}`;
      return publicUrl;
    } else {
      const errorText = await response.text();
      console.error("❌ Erro no upload:", errorText);
      throw new Error(`Upload failed with status: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("❌ Bunny CDN upload error:", error);
    throw error;
  }
}

/* =========================================================
   Função para deletar arquivo da Bunny CDN
========================================================= */
async function deleteFromBunny(url: string): Promise<void> {
  try {
    
    const storageZone = process.env.BUNNY_STORAGE_ZONE!;
    const accessKey = process.env.BUNNY_ACCESS_KEY!;
    const host = process.env.BUNNY_HOST!;

    // Extrair o caminho do arquivo da URL
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
  } catch (error) {
    console.error("❌ Error deleting file from Bunny:", error);
  }
}

/* =========================================================
   TIPAGEM para valores
========================================================= */
interface FormDataValue {
  image?: string;
  fileInfo?: {
    name: string;
    type: string;
    size: number;
    lastModified: number;
  };
  [key: string]: any;
}

/* =========================================================
   UPSERT (POST e PUT usam o mesmo código)
========================================================= */
async function handleUpsert(
  req: NextRequest,
  context: { params: Promise<{ type: string; subtype: string }> }
) {
  const { type, subtype } = await context.params;
  const form = await req.formData();

  const rawValues = form.get("values");
  const values = rawValues ? JSON.parse(rawValues as string) : [];
  const safeValues: FormDataValue[] = Array.isArray(values) ? values : [];

  // Buscar dados existentes para deletar arquivos antigos
  let existingData = null;
  try {
    existingData = await prisma.formData.findUnique({
      where: {
        type_subtype: { type, subtype },
      },
    });
  } catch (error) {
    console.log("⚠️ No existing data found or error fetching it");
  }

  // Processar uploads
  for (let i = 0; i < safeValues.length; i++) {
    const file = form.get(`file${i}`) as File | null;
    
    if (file && file.size > 0) {
      try {
        // Se houver imagem/vídeo antigo, deletar
        const existingValues = existingData?.values as FormDataValue[] | undefined;
        if (existingValues?.[i]?.image) {
          await deleteFromBunny(existingValues[i].image!);
        }

        const url = await uploadToBunny(file, `${type}/${subtype}`);
        safeValues[i].image = url;
        
        // Adicionar informações adicionais do arquivo
        safeValues[i].fileInfo = {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        };
        
      } catch (error) {
        console.error(`❌ Error uploading file for index ${i}:`, error);
        // Continuar mesmo se um upload falhar
      }
    } else {
      // Manter a imagem existente se não for enviada nova
      const existingValues = existingData?.values as FormDataValue[] | undefined;
      if (existingValues?.[i]?.image) {
        safeValues[i].image = existingValues[i].image;
        safeValues[i].fileInfo = existingValues[i].fileInfo;
      }
    }
  }

  const record = await prisma.formData.upsert({
    where: {
      type_subtype: {
        type,
        subtype,
      },
    },
    update: {
      values: safeValues,
    },
    create: {
      type,
      subtype,
      values: safeValues,
    },
  });

  return NextResponse.json(record);
}

/* =========================================================
   POST
========================================================= */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ type: string; subtype: string }> }
) {
  try {
    return await handleUpsert(req, context);
  } catch (err) {
    console.error("❌ POST ERROR:", err);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

/* =========================================================
   PUT
========================================================= */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ type: string; subtype: string }> }
) {
  try {
    return await handleUpsert(req, context);
  } catch (err) {
    console.error("❌ PUT ERROR:", err);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

/* =========================================================
   GET com sugestões
========================================================= */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string; subtype: string }> }
) {
  const { type, subtype } = await context.params;
  
  // Verificar se o cliente quer sugestões
  const { searchParams } = new URL(req.url);
  const includeSuggestions = searchParams.get('suggestions') === 'true';

  const record = await prisma.formData.findUnique({
    where: {
      type_subtype: { type, subtype },
    },
  });

  let suggestions = null;
  
  // Se for um tipo de logo e o cliente pediu sugestões
  if (type.startsWith('logos') && includeSuggestions) {
    suggestions = await getSuggestionsFromAllLogos();
  }

  return NextResponse.json({
    ...record,
    suggestions
  });
}

/* =========================================================
   DELETE
========================================================= */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ type: string; subtype: string }> }
) {
  const { type, subtype } = await context.params;

  try {
    // Buscar dados para deletar arquivos
    const existingData = await prisma.formData.findUnique({
      where: {
        type_subtype: { type, subtype },
      },
    });

    // Deletar todos os arquivos associados
    const existingValues = existingData?.values as FormDataValue[] | undefined;
    if (existingValues) {
      for (const item of existingValues) {
        if (item.image) {
          await deleteFromBunny(item.image);
        }
      }
    }

    // Deletar do banco de dados
    await prisma.formData.delete({
      where: {
        type_subtype: { type, subtype },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}