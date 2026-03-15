/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Lista todas as empresas
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: { subCompanies: true, _count: { select: { users: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(companies);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Cria uma nova empresa
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

    const company = await prisma.company.create({
      data: { name }
    });
    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}