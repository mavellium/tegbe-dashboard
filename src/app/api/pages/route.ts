/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Garante que se for passado nulo, vira um array vazio por padrão caso seja a intenção
    const safeFormData = formData ?? [];

    const page = await prisma.page.create({
      data: { title, subtitle, icon, endpoint, formData: safeFormData, subCompanyId }
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}