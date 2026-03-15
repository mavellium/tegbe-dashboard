/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const subCompanyId = searchParams.get("subCompanyId");
    const endpoint = searchParams.get("endpoint"); 

    if (!subCompanyId || !endpoint) {
      return NextResponse.json({ error: "Parâmetros insuficientes" }, { status: 400 });
    }

    const page = await prisma.page.findFirst({
      where: {
        subCompanyId: subCompanyId,
        endpoint: { endsWith: endpoint }
      }
    });

    if (!page) {
      return NextResponse.json({ error: "Página não configurada pelo Admin." }, { status: 404 });
    }

    return NextResponse.json({
      title: page.title,
      subtitle: page.subtitle,
      icon: page.icon,
      saveEndpoint: page.endpoint,
      schema: page.formData 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}