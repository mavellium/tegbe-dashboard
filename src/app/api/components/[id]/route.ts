import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const component = await prisma.component.findUnique({
      where: { id }
    });
    
    if (!component) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, component });
  } catch (error) {
    console.error("Erro ao buscar componente:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { name } = await req.json();

    const component = await prisma.component.update({
      where: { id: resolvedParams.id },
      data: { name }
    });

    return NextResponse.json({ success: true, component });
  } catch (error) {
    console.error("Erro ao renomear:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;

    await prisma.component.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}