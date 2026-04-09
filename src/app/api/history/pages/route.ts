/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const history = await prisma.pageHistory.findMany({
      orderBy: { createdAt: "desc" },
    });

    const grouped: Record<string, any> = {};

    for (const entry of history) {
      const originalPageId = (entry.snapshot as any)?.id || entry.pageId || entry.id;

      if (!grouped[originalPageId]) {
        grouped[originalPageId] = {
          originalPageId,
          title: entry.title,
          endpoint: entry.endpoint,
          icon: entry.icon,
          subCompanyId: entry.subCompanyId,
          versionCount: 0,
          lastModified: entry.createdAt,
          lastAction: entry.action,
        };
      }
      grouped[originalPageId].versionCount++;
    }

    return NextResponse.json(Object.values(grouped));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
