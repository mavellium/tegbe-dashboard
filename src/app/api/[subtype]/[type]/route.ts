// src/app/api/[subtype]/[type]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 👉 Preflight (OBRIGATÓRIO para evitar erro de CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET: Buscar dados por type e subtype
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ type: string; subtype: string }> }
) {
  try {
    const { subtype, type } = await context.params;

    const formData = await prisma.formData.findUnique({
      where: {
        type_subtype: {
          type,
          subtype,
        },
      },
    });

    if (!formData) {
      return NextResponse.json(
        {
          success: false,
          message: `Nenhum dado encontrado para ${type}/${subtype}`,
          exists: false,
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: formData.values,
        exists: true,
        id: formData.id,
        createdAt: formData.createdAt,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
