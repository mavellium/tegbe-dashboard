/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPageHistory } from "@/lib/page-history";
import { extractSlugFromPath, triggerRevalidateAsync } from "@/lib/revalidate";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      include: { subCompany: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(pages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { title, subtitle, icon, endpoint, formData, subCompanyId } = data;

    if (!title || !endpoint || !subCompanyId) {
      return NextResponse.json({ error: "Título, Endpoint e Filial são obrigatórios." }, { status: 400 });
    }

    // Se vier nulo, salva como objeto vazio (evita quebrar o Prisma)
    const safeFormData = formData ?? {};

    const page = await prisma.page.create({
      data: { title, subtitle, icon, endpoint, formData: safeFormData, subCompanyId }
    });
    await createPageHistory(page, "CREATED");
    triggerRevalidateAsync({ slug: extractSlugFromPath(page.endpoint) });
    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}