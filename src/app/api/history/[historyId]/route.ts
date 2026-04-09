/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ historyId: string }> }) {
  try {
    const { historyId } = await params;

    const entry = await prisma.pageHistory.findUnique({
      where: { id: historyId },
    });

    if (!entry) {
      return NextResponse.json({ error: "Registro de histórico não encontrado." }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ historyId: string }> }) {
  try {
    const { historyId } = await params;

    const entry = await prisma.pageHistory.findUnique({
      where: { id: historyId },
    });

    if (!entry) {
      return NextResponse.json({ error: "Registro de histórico não encontrado." }, { status: 404 });
    }

    await prisma.pageHistory.delete({ where: { id: historyId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
