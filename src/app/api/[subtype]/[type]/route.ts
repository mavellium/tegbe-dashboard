import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function extractFormIdsFromJson(obj: any, ids = new Set<string>()): string[] {
  if (typeof obj !== 'object' || obj === null) return Array.from(ids);
  
  if (obj.form_id && typeof obj.form_id === 'string' && obj.form_id.trim() !== '') {
    ids.add(obj.form_id);
  }
  
  for (const key in obj) {
    extractFormIdsFromJson(obj[key], ids);
  }
  
  return Array.from(ids);
}

function injectHtmlIntoJson(obj: any, componentsMap: Map<string, string>) {
  if (typeof obj !== 'object' || obj === null) return;
  
  if (obj.form_id && typeof obj.form_id === 'string') {
    const html = componentsMap.get(obj.form_id);
    if (html) {
      obj.form_html = html;
    }
  }
  
  for (const key in obj) {
    injectHtmlIntoJson(obj[key], componentsMap);
  }
}

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
      select: {
        values: true,
      },
    });

    if (!formData || !formData.values) {
      return NextResponse.json(
        null,
        { status: 404, headers: corsHeaders }
      );
    }

    const valuesData = JSON.parse(JSON.stringify(formData.values));
    const jsonFormIds = extractFormIdsFromJson(valuesData);

    if (jsonFormIds.length > 0) {
      const components = await prisma.component.findMany({
        where: {
          id: { in: jsonFormIds }
        },
        select: {
          id: true,
          html: true
        }
      });

      const componentsMap = new Map(components.map(c => [c.id, c.html]));
      injectHtmlIntoJson(valuesData, componentsMap);
    }

    return NextResponse.json(
      valuesData,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: corsHeaders }
    );
  }
}