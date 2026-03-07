import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'


// Renomear formulário
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // No Next.js 15, params precisa de await
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

// Excluir formulário
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // No Next.js 15, params precisa de await
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