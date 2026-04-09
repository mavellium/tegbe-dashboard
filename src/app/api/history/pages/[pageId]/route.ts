/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  try {
    const { pageId } = await params;

    const versions = await prisma.pageHistory.findMany({
      where: {
        OR: [
          { pageId },
          { snapshot: { path: ["id"], equals: pageId } },
        ],
      },
      orderBy: { version: "desc" },
    });

    if (versions.length === 0) {
      return NextResponse.json({ error: "Nenhum histórico encontrado para esta página." }, { status: 404 });
    }

    return NextResponse.json(versions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
