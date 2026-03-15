/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: { subCompanies: true, users: true }
    });
    if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await req.json();
    
    const company = await prisma.company.update({
      where: { id },
      data: { name }
    });
    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Empresa excluída com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}